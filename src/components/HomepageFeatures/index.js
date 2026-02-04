import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Ma documentation',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        On n&apos;a qu&apos;une seule mémoire, mais on en est jamais sûr tant qu&apos;on ne l&apos;a pas documenté.
      </>
    ),
  },
  {
    title: 'Mon blog',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        J&apos;adore partager ce que j&apos;apprend, je partage ici tout et n&apos;importe quoi tant que ça touche à de l&apos;informatique.
      </>
    ),
  },
  {
    title: "Un peut d'humour",
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        L&apos;informatique c&apos;est génial, mais rire un peu c&apos;est mieux. La documentation doit être sérieuse, mais le blog..... On verra ça plus tard
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}


export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
