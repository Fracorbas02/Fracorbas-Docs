/**
 * Composant Mermaid swizzlé (eject de @docusaurus/theme-mermaid).
 *
 * Différence avec l'original : pendant le rendu serveur et le premier
 * rendu client — avant que mermaid n'ait produit son SVG — la source
 * du diagramme est servie dans un <pre class="mermaid"> caché.
 *
 * Le site affiche le SVG dès que mermaid l'a rendu (le <pre> disparaît
 * au même endroit, sans flash). Le HTML statique, lui, contient la
 * source : c'est ce que lit le shell du portfolio (bastienbonora.fr)
 * pour dessiner le diagramme en ASCII dans son pager de lecture.
 */
import React, {useEffect, useRef} from 'react';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import {ErrorBoundaryErrorMessageFallback} from '@docusaurus/theme-common';
import {
  MermaidContainerClassName,
  useMermaidRenderResult,
} from '@docusaurus/theme-mermaid/client';
import styles from './styles.module.css';

function MermaidRenderResult({renderResult}) {
  const ref = useRef(null);
  useEffect(() => {
    const div = ref.current;
    renderResult.bindFunctions?.(div);
  }, [renderResult]);
  return (
    <div
      ref={ref}
      className={`${MermaidContainerClassName} ${styles.container}`}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{__html: renderResult.svg}}
    />
  );
}

function MermaidRenderer({value}) {
  const renderResult = useMermaidRenderResult({text: value});
  if (renderResult === null) {
    return (
      <pre className="mermaid" style={{display: 'none'}}>
        {value}
      </pre>
    );
  }
  return <MermaidRenderResult renderResult={renderResult} />;
}

export default function Mermaid(props) {
  return (
    <ErrorBoundary
      fallback={(params) => <ErrorBoundaryErrorMessageFallback {...params} />}
    >
      <MermaidRenderer {...props} />
    </ErrorBoundary>
  );
}
