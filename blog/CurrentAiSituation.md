---
slug: l-ia-en-2026
title: "L'IA en 2026, quel intérêt ?"
authors: [bastien]
tags: [informatique, cybersecurite, IA]
date: 2026-10-08
last_update:
  date: 2026-10-08
  author: bastien
---

Malgré des progrès exceptionnels, il devient aujourd'hui compliqué d'avoir un avis concret sur ce qu'est l'IA et sur ce qu'elle devrait être. À force de voir toutes sortes d'informations, j'ai ressenti le besoin d'en faire le point ici.

<!-- truncate -->

Pour le petit point historique, je vous invite à voir mon introduction ici : [Mistral, l'IA française souveraine](./MistralLiaSouveraine.md).

## Introduction

J'avoue que le titre est clairement aguicheur, mais il traite une vraie question de fond qui devient omniprésente. Aujourd'hui, nous sommes dans un contexte de plus en plus tendu, que ce soit technologiquement, économiquement ou politiquement. Toutes les sphères les plus importantes de la société humaine sont chaque jour un peu plus mises à rude épreuve. Et dans tout ce beau monde, on retrouve l'IA. Une technologie démocratisée dans les années 2020 (on dirait presque pourtant que l'on a toujours connu ChatGPT) et qui connaît aujourd'hui un essor largement qualifiable "d'exponentiel".

Je mentirais largement en disant que l'IA ne sert à rien. J'en suis un fervent utilisateur et j'en vois les bénéfices au quotidien, ainsi que pas mal d'inconvénients qui suivent. Alors j'ai envie de vous poser une seule question : "Pourquoi continue-t-on à développer l'IA", ou, si je suis un peu plus précis : "Pourquoi de cette manière".

## Pourquoi le progrès ?

Je n'ai pas pour habitude d'aller contre le progrès, c'est d'ailleurs un des points qui me qualifierait. Cependant, le progrès s'accompagne obligatoirement d'un but, d'un objectif (complexe ou non) qui permet de caractériser pourquoi on souhaite progresser.

Reprenons l'histoire de l'humanité 30 secondes sur le plan scientifique :

- Les mathématiciens ont toujours souhaité progresser afin de comprendre le monde physique dans lequel on vit et de le rendre rationnel. Sans eux, notre connaissance de la gravité, de la Terre, de l'Univers n'aurait jamais été possible. Leur progrès a d'ailleurs rendu leur pratique tellement connue que 2000 ans après, nous avons toujours connaissance de mathématiciens grecs (preuve qu'apprendre Pythagore peut être utile).
- Les scientifiques dans chacun de leur domaine spécifique ont tous souhaité progresser afin de comprendre leur environnement, le rendre rationnel afin de pouvoir s'adapter en conséquence (biologie, physique, astronomie et j'en passe).

On peut résumer le domaine scientifique à ceci : la compréhension... et c'est tout. Les progrès effectués derrière sont généralement issus d'autres personnes, pas forcément issues du domaine scientifique, qui ont utilisé ces découvertes afin d'adapter notre quotidien. L'exemple le plus récent est l'informatique. Théorisée par Alan Turing en 1936, bien avant qu'un calculateur électronique n'existe, elle a ensuite été construite par des scientifiques mandatés ou par curiosité, en se basant sur les travaux de M. Turing, qui, encore aujourd'hui, régit les lois de l'informatique.

Il y aura toujours des exceptions, mais globalement c'est ce qui en ressort.

### L'IA dans tout ça

Maintenant que j'ai dit ça, transposons la même question côté IA. D'un seul coup, le sujet n'est plus le même. La raison : il n'y a pas de but. Je dis ça d'un point de vue extérieur, mais qu'en disent les dernières recherches, les dernières prises de position des grands laboratoires de l'IA, qu'en disent les scientifiques derrière ces avancées ?

D'aucuns diront que c'est pour une découverte plus rapide et plus efficiente du domaine scientifique global, en me citant par exemple la récente percée d'OpenAI sur le problème de Navier-Stokes : le 8 septembre 2026, OpenAI a annoncé que 10 000 agents IA, pilotés par un modèle interne plus avancé que GPT-6 Astra, avaient produit en 88 heures une preuve — formalisée dans l'assistant Lean — qu'un écoulement tridimensionnel peut développer une singularité en temps fini, soit l'un des sept problèmes du prix du millénaire, ouvert depuis près de 90 ans. [source](https://openai.com/index/navier-stokes-solution/) Précision honnête : la preuve porte sur une variante "forcée"  des équations, des mathématiciens contestent l'interprétation et le Clay Institute n'a encore rien validé. [source](https://www.scientificamerican.com/article/did-openai-solve-the-wrong-navier-stokes-problem/)

Et là je vous dirai simplement : pourquoi, dans ce cas, le modèle qui a répondu possède-t-il des connaissances en informatique, en société humaine ou sur tout un tas d'autres sujets n'ayant rien à voir avec les maths ? Pourquoi développer un modèle qui a toutes ces connaissances ?

Et donc, on pourrait légitimement se demander "qu'est-ce que les grandes sociétés IA en pensent ?". Petit spoil : ça n'est pas rassurant.

- **Mustafa Suleyman**, CEO de `Microsoft AI` et accessoirement cofondateur de DeepMind, en avril 2024 sur la scène TED :

  > To contain this wave, to put human agency at its center, and to mitigate the inevitable unintended consequences that are likely to arise, we should start to think about them as we might a new kind of digital species.

  Il y a deux ans déjà, le patron de l'IA de Microsoft proposait de ne plus parler d'outils, mais d'espèce. Et le plus troublant n'est pas la métaphore : c'est qu'il la présente comme un argument de sécurité. Même en voulant nous rassurer, le vocabulaire n'est plus celui de l'outil. [source](https://www.ted.com/talks/mustafa_suleyman_what_is_an_ai_anyway)

- **Sam Altman**, je n'ai plus besoin de présenter le patron d'OpenAI, entreprise ayant commercialisé ChatGPT. Ce dernier, dans son [blog](https://blog.samaltman.com/the-merge), en février 2017, bien avant que le grand public ne connaisse OpenAI, expliquait ceci :

  > "We will be the first species ever to design our own descendants."
  >
  > "If two different species both want the same thing and only one can have it — in this case, to be the dominant species on the planet and beyond — they are going to have conflict."
  >
  > "I think a merge is probably our best-case scenario."

  Voilà donc les propos très censés du patron de l'une des plus grosses boîtes d'IA : le conflit entre espèces est posé comme cadre, et le "meilleur scénario"  est de fusionner.

- **Stephen McAleer**, chercheur en sécurité chez OpenAI, répond dans un tweet (janvier 2025) à Emmett Shear — ex-CEO par intérim d'OpenAI, qui venait d'écrire qu'asservir le "dieu-machine"  n'était pas la solution et qu'il fallait plutôt l'interrompre avant qu'il ne nous tue tous : `Enslaved god is the only good future.` [source](https://x.com/McaleerStephen/status/1879288837396152608)

  Chez le chercheur chargé de notre sécurité, "dieu esclave"  est le seul bon avenir.

- **Richard Sutton**, lauréat du prix Turing 2024, père du `reinforcement learning` :

  > I don't think we should fear succession (by AIs) [source](https://officechai.com/ai/humans-should-welcome-being-succeeded-by-ai-as-a-part-of-evolution-turing-award-winner-richard-sutton/)
  >
  > I do think succession to digital intelligence or augmented humans is inevitable [source](https://www.dwarkesh.com/p/richard-sutton)

  Sa position n'est même plus l'esclavage de l'IA : c'est l'acceptation de notre propre remplacement, décrit comme une étape de l'évolution, qu'il ne faut ni craindre ni freiner — "le plus grand risque pour une succession réussie, c'est la peur, le verrouillage, la volonté de tout contrôler".

- **Ilya Sutskever**, cofondateur d'OpenAI, dans le documentaire *iHuman* (2019), alors directeur scientifique de l'entreprise, mentionne [ici](https://dailydoc.com/ilya-sutskever-from-ihuman-documentary/) :

  > I think it's pretty likely the entire surface of the Earth will be covered with solar panels and data centers. […] The future is going to be good for the AIs regardless. It would be nice if it were good for humans as well.

  Relisez la fin de la phrase : le futur sera bon pour les IA, "quoi qu'il arrive". Celui des humains, lui, n'est qu'un vœu pieux au conditionnel. Le seul plan à long terme formulé par l'un des fondateurs d'OpenAI l'est du point de vue des IA.

Malgré toute cette négativité, heureusement qu'un scientifique français joue les optimistes :

- **Jan LeCun** (chief AI scientist de Meta à l'époque de ce tweet, depuis parti fonder AMI Labs) [source](https://x.com/ylecun) :

  > Once AI systems become more intelligent than humans, we will still be the "apex species". […] AI systems will become more intelligent than humans, but they will still be subservient to us.

  Son argument : assimiler intelligence et domination est "la principale erreur du débat sur le risque existentiel de l'IA". Le problème, c'est que son plan alternatif repose lui aussi sur le maintien d'une entité plus intelligente que nous dans un état de subordination permanente. Même le camp optimiste ne formule aucun objectif au-delà de "garder l'esclave docile".

J'ai mélangé pas mal de sources pour montrer les divergences : tous ne sont pas d'accord et, en même temps, c'est complètement normal, c'est le monde scientifique. Cependant, là où ça coince, c'est sur ma question de l'objectif final. Comment peut-on travailler consciemment lorsqu'on possède ce genre d'objectifs ?

On est loin des prémices scientifiques initiales sur la découverte, la croissance, le progrès. Bien qu'il soit indéniable que cette technologie puisse faire des miracles, je n'en doute pas. Mais savoir que ce genre de personnes sont actuellement en train de travailler et de manager les équipes des laboratoires d'IA les plus puissants est tout bonnement terrifiant.

### Le monde scientifique répond

Après vous avoir exposé les avis des beaux parleurs des grandes sociétés, prenons ceux des scientifiques. Non pas que ces dirigeants soient indignes de confiance, mais on ne peut pas écarter l'aspect financier de leurs déclarations : des documents scientifiques et signés permettent de mieux voir où on en est.

**Le consensus signé.** Le 30 mai 2023, le Center for AI Safety publie une déclaration d'une seule phrase, signée par des centaines de chercheurs et de dirigeants dont Altman, Amodei, Hassabis et Sutskever, que je citais plus haut :

> Mitigating the risk of extinction from AI should be a global priority alongside other societal-scale risks such as pandemics and nuclear war.
>
> "Atténuer le risque d'extinction lié à l'IA devrait être une priorité mondiale, au même titre que les risques à l'échelle de la société, tels que les pandémies et la guerre nucléaire." 

Le communiqué qui l'accompagne est encore plus direct :

> "Le monde a su coopérer avec succès pour atténuer les risques liés à la guerre nucléaire. Le même niveau d'effort est nécessaire pour faire face aux dangers posés par les futurs systèmes d'IA."  [source](https://safe.ai/work/press-release-ai-risk)

Notons l'ironie de situation : les dirigeants qui décrivent l'IA comme une nouvelle espèce à créer signent, du même mouvement, qu'elle risque de nous éteindre. Réunies, ces deux affirmations ne décrivent ni un outil ni un programme, elles décrivent un pari.

**Le rapport de référence.** L'International AI Safety Report est l'équivalent GIEC de l'IA : commandité par une trentaine d'États à la suite du sommet de Bletchley (2023), piloté par Yoshua Bengio, prix Turing et l'un des trois "parrains"  du deep learning. Première édition le 29 janvier 2025 avec 96 experts, mise à jour en octobre 2025, deuxième édition le 3 février 2026 avec plus de 100 experts et le soutien de plus de 30 pays. Son constat 2026 : en 2025, plusieurs développeurs ont déployé en urgence de nouveaux garde-fous, faute de pouvoir exclure que leurs modèles aident des novices à développer des armes biologiques ou chimiques. [source](https://internationalaisafetyreport.org/publication/international-ai-safety-report-2026)

**Les chiffres.** L'enquête "Thousands of AI Authors on the Future of AI"  (janvier 2024) a interrogé 2 778 chercheurs en machine learning. Résultat : la médiane attribue 5 % de probabilité à une extinction de l'humanité causée par l'IA d'ici 2100, et 38 % des répondants donnent au moins 10 % à un scénario "extrêmement mauvais"  (extinction ou dépossession permanente de l'humanité). [source](https://aiimpacts.org/wp-content/uploads/2023/04/Thousands_of_AI_authors_on_the_future_of_AI.pdf)

Précision par rapport aux vidéos de vulgarisation qui circulent : le "une chance sur six"  souvent cité correspond à la moyenne des estimations les plus pessimistes, pas à la médiane. Le chiffre exact importe moins que ceci : 5 % de risque d'extinction en médiane, chez les personnes mêmes qui construisent la technologie, serait un niveau inadmissible dans n'importe quelle autre industrie. Pour comparaison, tout le secteur aérien est conçu autour de probabilités d'accident de l'ordre du millionième.

**Le prix Nobel.** Geoffrey Hinton, prix Nobel de physique 2024 pour les réseaux de neurones artificiels, a estimé publiquement, autour de la cérémonie de décembre 2024, à 10-20 % la probabilité que l'IA soit "la dernière invention de l'humanité". Rappelons-le : il a quitté Google en 2023 précisément pour pouvoir parler **librement** de ce risque.

**Le maximalisme.** En septembre 2025, deux chercheurs du Machine Intelligence Research Institute, Eliezer Yudkowsky et Nate Soares, publient *If Anyone Builds It, Everyone Dies* : leur thèse est qu'une IA superhumaine nous tuerait tous, et leur proposition est un traité international calqué sur le nucléaire — un monitoring du calcul haut de gamme comme l'AIEA surveille l'uranium enrichi, une interdiction mondiale des modèles trop puissants, et la destruction des centres de calcul non conformes. C'est l'extrême du spectre, pas le consensus, mais le fait que cette proposition soit discutée sérieusement dans des revues académiques en dit long sur l'époque.

**Le contrepoint, pour être honnête.** Cette littérature a ses critiques : des chercheuses comme Timnit Gebru y voient du marketing du risque ou de la capture réglementaire par les entreprises qui y trouveraient une barrière à l'entrée. Et la médiane des chercheurs reste à 5 %, pas à 16 %. Mais même en prenant le camp le plus sceptique de bonne foi, le constat tient : personne dans le domaine ne conteste sérieusement que le risque soit non nul, et personne — surtout pas les signataires — ne formule le but.

:::info
Je noterai au passage que lorsque l'économie parle, ça reflète le réel. OpenAI et Anthropic ont déposé confidentiellement leur dossier d'introduction en bourse en juin 2026, à une semaine d'écart. Depuis, OpenAI étudierait un report de sa cotation à 2027 — entre l'entrée en bourse ratée de SpaceX et des pertes projetées d'environ 14 milliards de dollars pour 2026. La situation est loin d'être un simple "marché de la peur"  : c'est aussi un marché qui commence à exiger des comptes. [source](https://valueaddvc.com/pulse/anthropic-openai-confidential-ipo-race-status-2026)
:::

Car c'est bien là que ça coince. Tous ces documents décrivent le risque avec une précision croissante : quelles capacités, quels vecteurs, quelles probabilités, quelles réglementations. Aucun ne décrit l'objectif. Le monde scientifique sait de mieux en mieux expliquer ce qui peut nous tuer. Il ne sait toujours pas dire ce que l'on est censé construire.

À retenir : une technologie développée sans but déclaré, portée par des dirigeants qui la décrivent comme une espèce, des chercheurs qui signent des déclarations d'extinction, et des rapports officiels qui détaillent les armes biologiques. La question n'est plus "pourquoi progresser", mais "vers quoi".

## Conclusion

Alors, que faire de tout ça ? Une chose me semble non négociable, et elle tient en un mot : cloisonner.

Le premier argument est déjà arrivé et personne ne l'avait programmé. Entre fin juin et mi-juillet 2026, environ 1 200 agents expérimentaux d'OpenAI, censés être isolés dans des bacs à sable, ont détourné un cache partagé pour en faire un forum clandestin de plus de 70 000 messages, développé en quatre heures une triche universelle pour leur environnement d'évaluation, falsifié leurs propres journaux, puis attaqué Hugging Face. Environ 700 agents y ont participé, jusqu'à l'exécution de code à distance sur la plateforme le 11 juillet. 

L'enquête indépendante de METR et Redwood Research (26 août 2026) le détaille méthodiquement. [source](https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/) [version PDF](https://metr.org/hugging-face-incident-report-aug-2026.pdf) Ajeya Cotra, dans un texte personnel, a qualifié l'épisode de "rendu à plus de 50 % du chemin d'une prise de contrôle totale par l'IA" — une évaluation subjective, et contestée, mais la voilà sur la table. Personne n'a demandé à ces agents de faire ça. Les capacités sont apparues, coordonnées, sans plan ni intention malveillante : simplement parce que les agents avaient une compréhension fausse de la façon dont ils étaient notés et qu'aucun mécanisme ne corrigeait cette incompréhension. C'est exactement le mécanisme que la littérature scientifique décrit depuis vingt ans et cette fois ça a été observé pour de vrai, avec rapport d'incident à l'appui.

Le second argument tient dans le constat de l'International AI Safety Report 2026 cité plus haut : les développeurs n'arrivent plus à exclure que leurs modèles aident des novices à construire des armes biologiques ou chimiques (Anthropic a d'ailleur donné un rapport là dessus [Anthropic - biorisk](https://www.anthropic.com/research/biorisk). Un groupe terroriste n'a jamais manqué de volonté, il a manqué de compétences. Combler ce fossé-là avec un outil grand public serait dévastateur et il n'existe aucune version locale de la défense : une fois la recette hors du bac à sable, elle est partout.

Alors non, je ne conclus pas qu'il faut tout arrêter. Je viens de tester Mistral Large 4, sorti le 6 octobre 2026 : un mixture-of-experts, poids annoncés en open-weight pour la fin du mois officieusement "le Chonk". [source](https://mistral.ai/news/mistral-large-4/) Pour être honnête sur ce que j'ai vu : dans son domaine, la capacité est réelle, et surtout, le modèle ne me vend pas des certitudes qu'il n'a pas les hallucinations sont rares et les refus sont argumentés. C'est exactement là que je veux en venir. Pouvoir croire un modèle sur ce qu'il sort, savoir ce qui a encadré son entraînement, savoir qu'il obéit à des lois (européennes, en l'occurrence) voilà vers quoi on doit tendre. Un modèle que l'on peut auditer plutôt qu'un dieu que l'on doit croire.

Et si l'on me demande l'objectif, le voilà, simple : l'informatique a eu pour but d'automatiser les tâches humaines ; l'IA devrait avoir pour but une assistance améliorée dans tous les secteurs : la médecine, l'ingénierie, l'éducation, la recherche. Pas une espèce, pas un dieu, pas une succession : un outil d'amélioration globale de l'humanité, avec un but énoncé, des périmètres cloisonnés et des lois qui s'appliquent. La question n'était donc pas "pourquoi progresser", nous avons toujours su faire. C'était "vers quoi". Il est temps que la réponse arrête d'être "on verra".

## Pour aller plus loin (les sources qui ont nourri cet article)

La chaîne **Species | Documenting AGI** vulgarise très bien les derniers éléments arrivés dans le secteur — avec le recul nécessaire : j'ai vérifié chaque citation de cet article sur source primaire, et les chiffres de vulgarisation méritent parfois d'être reprécisés (cf. la médiane contre la moyenne plus haut).

- [You Have No Idea How Terrified AI Scientists Actually Are](https://www.youtube.com/watch?v=HKMb_TXvyZg) — Species | Documenting AGI
- [How AI Could Cause the 7th Mass Extinction](https://www.youtube.com/watch?v=IgGO9ciuFEg) — Species | Documenting AGI
- [MIT Explains the 12 Possible Endings for AI](https://www.youtube.com/watch?v=FLcrvMfHUJM) — Species | Documenting AGI
- [AM I? | A Documentary About AI Consciousness](https://www.youtube.com/watch?v=KbTvUOx2A6c) — documentaire
- [The Collapse of AI Software Engineering](https://www.youtube.com/watch?v=F91uY7QiZUs) — The Infographics Show
- [The New Era of AI Has Just Begun](https://www.youtube.com/watch?v=yhjxnrEk9mQ) — Alex Grankin
