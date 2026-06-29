const endpoint = import.meta.env.VITE_RADAR_LATEST_URL || '/api/radar/latest';

const isRecord = (value) => (
    value !== null && typeof value === 'object' && !Array.isArray(value)
);

const isNonEmptyString = (value) => (
    typeof value === 'string' && value.trim().length > 0
);

export function normalizeLatestRadarPost(payload) {
    if (!isRecord(payload) || !isRecord(payload.post)) {
        return null;
    }

    const { post } = payload;

    if (
        !isNonEmptyString(post.title)
        || !isNonEmptyString(post.summary)
        || !isNonEmptyString(post.href)
        || !isNonEmptyString(post.category)
        || !isNonEmptyString(post.dateLabel)
    ) {
        return null;
    }

    return {
        href: post.href,
        title: post.title,
        excerpt: post.summary,
        source: isNonEmptyString(post.source) ? post.source : 'Blink Radar',
        readTime: isNonEmptyString(post.readTime) ? post.readTime : '4 min de leitura',
        meta: `Último post · ${post.dateLabel}`,
        tags: Array.isArray(post.tags) && post.tags.length > 0
            ? post.tags.filter(isNonEmptyString).slice(0, 3)
            : [post.category, 'Último post', 'PMEs'],
    };
}

export async function fetchLatestRadarPost() {
    const response = await fetch(endpoint, {
        headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
        throw new Error(`Latest Radar request failed with status ${response.status}`);
    }

    return normalizeLatestRadarPost(await response.json());
}
