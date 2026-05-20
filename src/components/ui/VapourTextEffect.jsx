import React, { useRef, useEffect, useState, createElement, useMemo, useCallback, memo } from "react";

export const Tag = {
    H1: "h1",
    H2: "h2",
    H3: "h3",
    P: "p",
};

export default function VaporizeTextCycle({
    texts = ["Next.js", "React"],
    font = {
        fontFamily: "sans-serif",
        fontSize: "50px",
        fontWeight: 400,
    },
    color = "rgb(255, 255, 255)",
    spread = 5,
    density = 5,
    particleSize = 2, // Defaulting to 2px dust as requested
    animation = {
        vaporizeDuration: 2,
        fadeInDuration: 1,
        waitDuration: 0.5,
    },
    direction = "left-to-right",
    alignment = "center",
    tag = Tag.H1,
    // New props for decoupled triggering
    isVaporizing = false,
    startFadedOut = true
}) {
    const canvasRef = useRef(null);
    const wrapperRef = useRef(null);
    const isInView = useIsInView(wrapperRef);
    const lastFontRef = useRef(null);
    const particlesRef = useRef([]);
    const animationFrameRef = useRef(null);
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    // States: static | vaporizing | fadingIn | waiting | vaporized
    const [animationState, setAnimationState] = useState(startFadedOut ? "fadingIn" : "static");
    const vaporizeProgressRef = useRef(0);
    const fadeOpacityRef = useRef(startFadedOut ? 0 : 1);
    const [wrapperSize, setWrapperSize] = useState({ width: 0, height: 0 });
    const transformedDensity = transformValue(density, [0, 10], [0.3, 1], true);

    // External Control Effect
    useEffect(() => {
        if (isVaporizing && (animationState === "static" || animationState === "fadingIn" || animationState === "waiting")) {
            setAnimationState("vaporizing");
            vaporizeProgressRef.current = 0;
        } else if (!isVaporizing && animationState === "vaporized") {
            setAnimationState("fadingIn");
            fadeOpacityRef.current = 0;
            resetParticles(particlesRef.current);
        }
    }, [isVaporizing]);

    // Calculate device pixel ratio
    const globalDpr = useMemo(() => {
        if (typeof window !== "undefined") {
            return window.devicePixelRatio * 1.5 || 1;
        }
        return 1;
    }, []);

    // Memoize static styles
    const wrapperStyle = useMemo(() => ({
        width: "100%",
        height: "100%",
        pointerEvents: "none",
    }), []);

    const canvasStyle = useMemo(() => ({
        minWidth: "30px",
        minHeight: "20px",
        pointerEvents: "none",
    }), []);

    // Memoize animation durations
    const animationDurations = useMemo(() => ({
        VAPORIZE_DURATION: (animation.vaporizeDuration ?? 2) * 1000,
        FADE_IN_DURATION: (animation.fadeInDuration ?? 1) * 1000,
        WAIT_DURATION: (animation.waitDuration ?? 0.5) * 1000,
    }), [animation.vaporizeDuration, animation.fadeInDuration, animation.waitDuration]);

    // Memoize font and spread calculations
    const fontConfig = useMemo(() => {
        const fontSize = parseInt(font.fontSize?.replace("px", "") || "50");
        const VAPORIZE_SPREAD = calculateVaporizeSpread(fontSize);
        const MULTIPLIED_VAPORIZE_SPREAD = VAPORIZE_SPREAD * spread;
        return {
            fontSize,
            VAPORIZE_SPREAD,
            MULTIPLIED_VAPORIZE_SPREAD,
            font: `${font.fontWeight ?? 400} ${fontSize * globalDpr}px ${font.fontFamily}`,
        };
    }, [font.fontSize, font.fontWeight, font.fontFamily, spread, globalDpr]);

    // Memoize particle update function
    const memoizedUpdateParticles = useCallback((particles, vaporizeX, deltaTime) => {
        return updateParticles(
            particles,
            vaporizeX,
            deltaTime,
            fontConfig.MULTIPLIED_VAPORIZE_SPREAD,
            animationDurations.VAPORIZE_DURATION,
            direction,
            transformedDensity
        );
    }, [fontConfig.MULTIPLIED_VAPORIZE_SPREAD, animationDurations.VAPORIZE_DURATION, direction, transformedDensity]);

    // Memoize render function
    const memoizedRenderParticles = useCallback((ctx, particles) => {
        renderParticles(ctx, particles, globalDpr, particleSize);
    }, [globalDpr, particleSize]);

    // Animation loop - only run when in view
    useEffect(() => {
        if (!isInView) return;

        let lastTime = performance.now();
        let frameId;

        const animate = (currentTime) => {
            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;

            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");

            if (!canvas || !ctx || !particlesRef.current.length) {
                frameId = requestAnimationFrame(animate);
                return;
            }

            // Clear canvas only if we're going to draw
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update based on animation state
            switch (animationState) {
                case "static": {
                    memoizedRenderParticles(ctx, particlesRef.current);
                    break;
                }
                case "vaporized": {
                    // Do nothing, particles are gone
                    break;
                }
                case "vaporizing": {
                    // Calculate progress based on duration
                    vaporizeProgressRef.current += deltaTime * 100 / (animationDurations.VAPORIZE_DURATION / 1000);

                    // Get text boundaries
                    const textBoundaries = canvas.textBoundaries;
                    if (!textBoundaries) break;

                    // Calculate vaporize position based on text boundaries and direction
                    const progress = Math.min(100, vaporizeProgressRef.current);
                    const vaporizeX = direction === "left-to-right"
                        ? textBoundaries.left + textBoundaries.width * progress / 100
                        : textBoundaries.right - textBoundaries.width * progress / 100;

                    const allVaporized = memoizedUpdateParticles(particlesRef.current, vaporizeX, deltaTime);
                    memoizedRenderParticles(ctx, particlesRef.current);

                    // Check if vaporization is complete
                    if (vaporizeProgressRef.current >= 100 && allVaporized) {
                        // Decoupled logic doesn't automatically loop texts
                        setAnimationState("vaporized");
                    }
                    break;
                }
                case "fadingIn": {
                    fadeOpacityRef.current += deltaTime * 1000 / animationDurations.FADE_IN_DURATION;

                    // Use particles for fade-in
                    ctx.save();
                    ctx.scale(globalDpr, globalDpr);
                    particlesRef.current.forEach(particle => {
                        particle.x = particle.originalX;
                        particle.y = particle.originalY;
                        const MathOpacity = Math.min(fadeOpacityRef.current, 1);
                        const opacity = MathOpacity * particle.originalAlpha;
                        // Easing on the fade
                        const displayOpacity = Math.pow(opacity, 1.5);

                        const color = particle.color.replace(/[\d.]+\)$/, `${displayOpacity})`);
                        ctx.fillStyle = color;
                        ctx.fillRect(particle.x / globalDpr, particle.y / globalDpr, particleSize, particleSize);
                    });
                    ctx.restore();

                    if (fadeOpacityRef.current >= 1) {
                        setAnimationState("waiting");
                    }
                    break;
                }
                case "waiting": {
                    memoizedRenderParticles(ctx, particlesRef.current);
                    if (isVaporizing) {
                        setAnimationState("vaporizing");
                        vaporizeProgressRef.current = 0;
                    }
                    break;
                }
            }

            frameId = requestAnimationFrame(animate);
        };

        frameId = requestAnimationFrame(animate);

        return () => {
            if (frameId) {
                cancelAnimationFrame(frameId);
            }
        };
    }, [
        animationState,
        isInView,
        texts.length,
        direction,
        globalDpr,
        memoizedUpdateParticles,
        memoizedRenderParticles,
        animationDurations.FADE_IN_DURATION,
        animationDurations.WAIT_DURATION,
        animationDurations.VAPORIZE_DURATION,
        isVaporizing
    ]);

    useEffect(() => {
        renderCanvas({
            framerProps: {
                texts,
                font,
                color,
                alignment,
            },
            canvasRef: canvasRef,
            wrapperSize,
            particlesRef,
            globalDpr,
            currentTextIndex,
            transformedDensity,
        });

        const currentFont = font.fontFamily || "sans-serif";
        return handleFontChange({
            currentFont,
            lastFontRef,
            canvasRef: canvasRef,
            wrapperSize,
            particlesRef,
            globalDpr,
            currentTextIndex,
            transformedDensity,
            framerProps: {
                texts,
                font,
                color,
                alignment,
            },
        });
    }, [texts, font, color, alignment, wrapperSize, currentTextIndex, globalDpr, transformedDensity]);

    // Handle resize
    useEffect(() => {
        const container = wrapperRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setWrapperSize({ width, height });
            }

            renderCanvas({
                framerProps: {
                    texts,
                    font,
                    color,
                    alignment,
                },
                canvasRef: canvasRef,
                wrapperSize: { width: container.clientWidth, height: container.clientHeight },
                particlesRef,
                globalDpr,
                currentTextIndex,
                transformedDensity,
            });
        });

        resizeObserver.observe(container);
        return () => {
            resizeObserver.disconnect();
        };
    }, [wrapperRef.current]);

    // Initial size detection
    useEffect(() => {
        if (wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            setWrapperSize({
                width: rect.width,
                height: rect.height,
            });
        }
    }, []);

    return (
        <div ref={wrapperRef} style={wrapperStyle}>
            <canvas ref={canvasRef} style={canvasStyle} />
            <SeoElement tag={tag} texts={texts} />
        </div>
    );
}

// ------------------------------------------------------------ //
// SEO ELEMENT
// ------------------------------------------------------------ //
const SeoElement = memo(({ tag = Tag.P, texts }) => {
    const style = useMemo(() => ({
        position: "absolute",
        width: "0",
        height: "0",
        overflow: "hidden",
        userSelect: "none",
        pointerEvents: "none",
    }), []);

    const safeTag = Object.values(Tag).includes(tag) ? tag : "p";
    return createElement(safeTag, { style }, texts?.join(" ") ?? "");
});

// ------------------------------------------------------------ //
// FONT HANDLING
// ------------------------------------------------------------ //
const handleFontChange = ({
    currentFont,
    lastFontRef,
    canvasRef,
    wrapperSize,
    particlesRef,
    globalDpr,
    currentTextIndex,
    transformedDensity,
    framerProps,
}) => {
    if (currentFont !== lastFontRef.current) {
        lastFontRef.current = currentFont;

        const timeoutId = setTimeout(() => {
            cleanup({ canvasRef, particlesRef });
            renderCanvas({
                framerProps,
                canvasRef,
                wrapperSize,
                particlesRef,
                globalDpr,
                currentTextIndex,
                transformedDensity,
            });
        }, 1000);

        return () => {
            clearTimeout(timeoutId);
            cleanup({ canvasRef, particlesRef });
        };
    }
    return undefined;
};

// ------------------------------------------------------------ //
// CLEANUP
// ------------------------------------------------------------ //
const cleanup = ({ canvasRef, particlesRef }) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (particlesRef.current) {
        particlesRef.current = [];
    }
};

// ------------------------------------------------------------ //
// RENDER CANVAS
// ------------------------------------------------------------ //
const renderCanvas = ({
    framerProps,
    canvasRef,
    wrapperSize,
    particlesRef,
    globalDpr,
    currentTextIndex,
    transformedDensity,
}) => {
    const canvas = canvasRef.current;
    if (!canvas || !wrapperSize.width || !wrapperSize.height) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = wrapperSize;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.floor(width * globalDpr);
    canvas.height = Math.floor(height * globalDpr);

    const color = parseColor(framerProps.color ?? "rgb(153, 153, 153)");
    const requestedFontSize = parseInt(framerProps.font?.fontSize?.replace("px", "") || "50");
    const resolvedFontSize = resolveFittedFontSize({
        ctx,
        text: framerProps.texts[currentTextIndex] || "Next.js",
        width: canvas.width,
        requestedFontSize,
        fontWeight: framerProps.font?.fontWeight ?? 400,
        fontFamily: framerProps.font?.fontFamily ?? "sans-serif",
        alignment: framerProps.alignment || "left",
        globalDpr,
    });
    const font = `${framerProps.font?.fontWeight ?? 400} ${resolvedFontSize * globalDpr}px ${framerProps.font?.fontFamily ?? "sans-serif"}`;

    let textX;
    const textY = canvas.height / 2;
    const currentText = framerProps.texts[currentTextIndex] || "Next.js";

    if (framerProps.alignment === "center") {
        textX = canvas.width / 2;
    } else if (framerProps.alignment === "left") {
        textX = 0;
    } else {
        textX = canvas.width;
    }

    const { particles, textBoundaries } = createParticles(ctx, canvas, currentText, textX, textY, font, color, framerProps.alignment || "left");

    particlesRef.current = particles;
    canvas.textBoundaries = textBoundaries;
};

// ------------------------------------------------------------ //
// PARTICLE SYSTEM
// ------------------------------------------------------------ //
const createParticles = (
    ctx,
    canvas,
    text,
    textX,
    textY,
    font,
    color,
    alignment
) => {
    const particles = [];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = alignment;
    ctx.textBaseline = "middle";
    ctx.imageSmoothingQuality = "high";
    ctx.imageSmoothingEnabled = true;

    if ('fontKerning' in ctx) {
        ctx.fontKerning = "normal";
    }

    if ('textRendering' in ctx) {
        ctx.textRendering = "geometricPrecision";
    }

    const metrics = ctx.measureText(text);
    let textLeft;
    const textWidth = metrics.width;

    if (alignment === "center") {
        textLeft = textX - textWidth / 2;
    } else if (alignment === "left") {
        textLeft = textX;
    } else {
        textLeft = textX - textWidth;
    }

    const textBoundaries = {
        left: textLeft,
        right: textLeft + textWidth,
        width: textWidth,
    };

    ctx.fillText(text, textX, textY);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const baseDPR = 3;
    const currentDPR = canvas.width / parseInt(canvas.style.width);
    const baseSampleRate = Math.max(1, Math.round(currentDPR / baseDPR));
    const sampleRate = Math.max(1, Math.round(baseSampleRate));

    for (let y = 0; y < canvas.height; y += sampleRate) {
        for (let x = 0; x < canvas.width; x += sampleRate) {
            const index = (y * canvas.width + x) * 4;
            const alpha = data[index + 3];

            if (alpha > 0) {
                const originalAlpha = alpha / 255 * (sampleRate / currentDPR);
                const particle = {
                    x,
                    y,
                    originalX: x,
                    originalY: y,
                    color: `rgba(${data[index]}, ${data[index + 1]}, ${data[index + 2]}, ${originalAlpha})`,
                    opacity: originalAlpha,
                    originalAlpha,
                    velocityX: 0,
                    velocityY: 0,
                    angle: 0,
                    speed: 0,
                };

                particles.push(particle);
            }
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    return { particles, textBoundaries };
};

const resolveFittedFontSize = ({
    ctx,
    text,
    width,
    requestedFontSize,
    fontWeight,
    fontFamily,
    alignment,
    globalDpr,
}) => {
    const horizontalPadding = alignment === "center" ? 0.18 : 0.08;
    const maxTextWidth = width * (1 - horizontalPadding);
    let fontSize = requestedFontSize;

    while (fontSize > 16) {
        ctx.font = `${fontWeight} ${fontSize * globalDpr}px ${fontFamily}`;
        if (ctx.measureText(text).width <= maxTextWidth) {
            break;
        }
        fontSize -= 2;
    }

    return fontSize;
};

const updateParticles = (
    particles,
    vaporizeX,
    deltaTime,
    MULTIPLIED_VAPORIZE_SPREAD,
    VAPORIZE_DURATION,
    direction,
    density
) => {
    let allParticlesVaporized = true;

    particles.forEach(particle => {
        const shouldVaporize = direction === "left-to-right"
            ? particle.originalX <= vaporizeX
            : particle.originalX >= vaporizeX;

        if (shouldVaporize) {
            if (particle.speed === 0) {
                particle.angle = Math.random() * Math.PI * 2;
                // Increase speed logic to make vaporize punchier
                particle.speed = (Math.random() * 2 + 1.0) * MULTIPLIED_VAPORIZE_SPREAD;
                particle.velocityX = Math.cos(particle.angle) * particle.speed;
                particle.velocityY = Math.sin(particle.angle) * particle.speed;

                particle.shouldFadeQuickly = Math.random() > density;
            }

            if (particle.shouldFadeQuickly) {
                particle.opacity = Math.max(0, particle.opacity - deltaTime * 2);
            } else {
                const dx = particle.originalX - particle.x;
                const dy = particle.originalY - particle.y;
                const distanceFromOrigin = Math.sqrt(dx * dx + dy * dy);

                const dampingFactor = Math.max(0.90, 1 - distanceFromOrigin / (100 * MULTIPLIED_VAPORIZE_SPREAD));

                const randomSpread = MULTIPLIED_VAPORIZE_SPREAD * 4;
                const spreadX = (Math.random() - 0.5) * randomSpread;
                const spreadY = (Math.random() - 0.5) * randomSpread;

                particle.velocityX = (particle.velocityX + spreadX + dx * 0.002) * dampingFactor;
                particle.velocityY = (particle.velocityY + spreadY + dy * 0.002) * dampingFactor;

                const maxVelocity = MULTIPLIED_VAPORIZE_SPREAD * 3;
                const currentVelocity = Math.sqrt(particle.velocityX * particle.velocityX + particle.velocityY * particle.velocityY);

                if (currentVelocity > maxVelocity) {
                    const scale = maxVelocity / currentVelocity;
                    particle.velocityX *= scale;
                    particle.velocityY *= scale;
                }

                // Boost physics multiplier
                particle.x += particle.velocityX * deltaTime * 30;
                particle.y += particle.velocityY * deltaTime * 20;

                const baseFadeRate = 0.5;
                const durationBasedFadeRate = baseFadeRate * (2000 / VAPORIZE_DURATION);

                particle.opacity = Math.max(0, particle.opacity - deltaTime * durationBasedFadeRate);
            }

            if (particle.opacity > 0.01) {
                allParticlesVaporized = false;
            }
        } else {
            allParticlesVaporized = false;
        }
    });

    return allParticlesVaporized;
};

const renderParticles = (ctx, particles, globalDpr, particleSize) => {
    ctx.save();
    ctx.scale(globalDpr, globalDpr);

    particles.forEach(particle => {
        if (particle.opacity > 0) {
            const color = particle.color.replace(/[\d.]+\)$/, `${particle.opacity})`);
            ctx.fillStyle = color;
            ctx.fillRect(particle.x / globalDpr, particle.y / globalDpr, particleSize, particleSize);
        }
    });

    ctx.restore();
};

const resetParticles = (particles) => {
    particles.forEach(particle => {
        particle.x = particle.originalX;
        particle.y = particle.originalY;
        particle.opacity = particle.originalAlpha;
        particle.speed = 0;
        particle.velocityX = 0;
        particle.velocityY = 0;
    });
};

const calculateVaporizeSpread = (fontSize) => {
    const size = typeof fontSize === "string" ? parseInt(fontSize) : fontSize;

    const points = [
        { size: 20, spread: 0.2 },
        { size: 50, spread: 0.5 },
        { size: 100, spread: 2.0 }
    ];

    if (size <= points[0].size) return points[0].spread;
    if (size >= points[points.length - 1].size) return points[points.length - 1].spread;

    let i = 0;
    while (i < points.length - 1 && points[i + 1].size < size) i++;

    const p1 = points[i];
    const p2 = points[i + 1];

    return p1.spread + (size - p1.size) * (p2.spread - p1.spread) / (p2.size - p1.size);
};

const parseColor = (color) => {
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);

    if (rgbaMatch) {
        const [_, r, g, b, a] = rgbaMatch;
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    } else if (rgbMatch) {
        const [_, r, g, b] = rgbMatch;
        return `rgba(${r}, ${g}, ${b}, 1)`;
    }

    console.warn("Could not parse color:", color);
    return "rgba(0, 0, 0, 1)";
};

function transformValue(input, inputRange, outputRange, clamp = false) {
    const [inputMin, inputMax] = inputRange;
    const [outputMin, outputMax] = outputRange;

    const progress = (input - inputMin) / (inputMax - inputMin);
    let result = outputMin + progress * (outputMax - outputMin);

    if (clamp) {
        if (outputMax > outputMin) {
            result = Math.min(Math.max(result, outputMin), outputMax);
        } else {
            result = Math.min(Math.max(result, outputMax), outputMin);
        }
    }

    return result;
}

function useIsInView(ref) {
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.isIntersecting);
            },
            { threshold: 0, rootMargin: '50px' }
        );

        observer.observe(ref.current);

        return () => {
            observer.disconnect();
        };
    }, [ref]);

    return isInView;
}
