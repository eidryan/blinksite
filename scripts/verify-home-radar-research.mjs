import { existsSync, readFileSync } from 'node:fs';

const checks = [];

function read(path) {
  if (!existsSync(path)) {
    throw new Error(`Missing required file: ${path}`);
  }
  return readFileSync(path, 'utf8');
}

function expectIncludes(name, content, expected) {
  checks.push({ name, pass: content.includes(expected), expected });
}

function expectNotIncludes(name, content, forbidden) {
  checks.push({ name, pass: !content.includes(forbidden), expected: `not ${forbidden}` });
}

function expectOrder(name, content, first, second) {
  checks.push({
    name,
    pass: content.indexOf(first) !== -1 && content.indexOf(second) !== -1 && content.indexOf(first) < content.indexOf(second),
    expected: `${first} before ${second}`,
  });
}

const app = read('src/App.jsx');
const navbar = read('src/components/Navbar.jsx');
const founders = read('src/components/Fundadores.jsx');
const sectionsPath = 'src/components/RadarResearchSections.jsx';
const sections = read(sectionsPath);

expectIncludes('App imports RadarResearchSections', app, "import RadarResearchSections from './components/RadarResearchSections';");
expectOrder('App renders sections after Portfolio', app, '<Portfolio />', '<RadarResearchSections />');
expectOrder('App renders founders after sections', app, '<RadarResearchSections />', '<Fundadores />');

expectIncludes('Radar section id exists', sections, 'id="radar"');
expectIncludes('Research section id exists', sections, 'id="research"');
expectIncludes('Radar label exists', sections, '04. Radar');
expectIncludes('Research label exists', sections, '05. Research');
expectIncludes('Radar headline exists', sections, 'O que está mudando no mercado, antes de virar consenso.');
expectIncludes('Research headline exists', sections, 'Pesquisa aplicada para aproximar academia e mercado.');
expectIncludes('Research approved copy exists', sections, 'O ambiente onde a Blink aproxima as PMEs brasileiras do que está sendo produzido na academia: papers, pesquisas e ferramentas aplicadas que podem sair do laboratório e virar decisão, operação e produto no mercado real.');
expectIncludes('Radar CTA destination exists', sections, 'href="/radar"');
expectIncludes('Research CTA destination exists', sections, 'href="/research"');
expectIncludes('Radar CTA text exists', sections, 'Conhecer o Radar');
expectIncludes('Research CTA text exists', sections, 'Explorar Research');
expectNotIncludes('Public component does not mention UFF', sections, 'UFF');

expectIncludes('Navbar Radar anchor exists', navbar, "{ name: 'Radar', href: '#radar' }");
expectIncludes('Navbar Research anchor exists', navbar, "{ name: 'Research', href: '#research' }");
expectOrder('Navbar order puts Radar before Research', navbar, "{ name: 'Radar', href: '#radar' }", "{ name: 'Research', href: '#research' }");
expectIncludes('Founders label is renumbered', founders, '06. Fundadores');
expectNotIncludes('Old founders label is removed', founders, '04. Fundadores');

const failed = checks.filter((check) => !check.pass);

if (failed.length > 0) {
  console.error('Home Radar/Research verification failed:');
  for (const check of failed) {
    console.error(`- ${check.name}: expected ${check.expected}`);
  }
  process.exit(1);
}

console.log(`Home Radar/Research verification passed (${checks.length} checks).`);
