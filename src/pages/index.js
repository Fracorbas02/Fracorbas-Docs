import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

/* ─── Données des cartes ──────────────────────────────────────── */
const features = [
  {
    icon: '📡',
    title: 'Documentation technique',
    description:
      'Réseaux, virtualisation, systèmes — des guides rédigés au fil de mes expérimentations, de Proxmox au modèle OSI.',
    link: '/docs/category/protocoles',
    linkLabel: 'Parcourir la doc →',
  },
  {
    icon: '✍️',
    title: 'Blog',
    description:
      "Retours d'expérience, réflexions et découvertes du quotidien dans le monde de l'infra et de l'open source.",
    link: '/blog',
    linkLabel: 'Lire les articles →',
  },
  {
    icon: '🧑‍💻',
    title: 'Portfolio',
    description:
      'Mes projets, mon parcours et ce que je construis pour continuer à progresser chaque jour.',
    link: 'https://bastienbonora.fr',
    linkLabel: 'Voir le portfolio →',
    external: true,
  },
];

/* ─── Carte feature ───────────────────────────────────────────── */
function FeatureCard({ icon, title, description, link, linkLabel, external }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardIcon}>{icon}</div>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDesc}>{description}</p>
      <Link
        to={link}
        className={styles.cardLink}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {linkLabel}
      </Link>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */
export default function Home() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title="Blog et documentation technique"
      description="Documentation personnelle sur les réseaux, les systèmes et la virtualisation. Articles techniques, guides et réflexions open source."
    >
      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroGlow}  aria-hidden="true" />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>// documentation &amp; blog</p>
          <Heading as="h1" className={styles.heroTitle}>
            Bastodoc
          </Heading>
          <p className={styles.heroSubtitle}>
            Réseaux · Systèmes · Virtualisation · Open Source
          </p>
          <p className={styles.heroDesc}>
            Un espace pour documenter ce que j'apprends, partager ce que je découvre
            et garder une trace de tout ce qui mérite d'être retenu.
          </p>
          <div className={styles.heroCtas}>
            <Link
              to="/docs/category/protocoles"
              className={clsx(styles.btnPrimary)}
            >
              Documentation
            </Link>
            <Link to="/blog" className={clsx(styles.btnOutline)}>
              Blog
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* ── Cards ── */}
        <section className={styles.features}>
          <div className="container">
            <div className={styles.cardsGrid}>
              {features.map((f) => (
                <FeatureCard key={f.title} {...f} />
              ))}
            </div>
          </div>
        </section>

        {/* ── À propos ── */}
        <section className={styles.about}>
          <div className="container">
            <div className={styles.aboutInner}>
              <span className={styles.aboutTag}>À propos</span>
              <p className={styles.aboutText}>
                Ce site est né d'une envie simple : ne plus perdre ce que j'apprends.
                Qu'il s'agisse de configurer Proxmox, comprendre un protocole réseau ou
                explorer un nouvel outil open source — tout finit ici, documenté et partagé.
                L'objectif est autant de me constituer une base de connaissances personnelle
                que de contribuer, modestement, à la communauté.
              </p>
              <Link
                to="https://github.com/Fracorbas02"
                className={styles.aboutLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                fracorbas sur GitHub →
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
