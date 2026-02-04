// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Bastodoc',
  tagline: 'Mon blog et mes documentations en un seul site',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://docs.bastienbonora.fr',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  // organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'bastodoc', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr'],
  },
  themes: ['@docusaurus/theme-mermaid'],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],
  markdown: {
      mermaid: true,
    },

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/presentation.png',
      navbar: {
        title: 'Bastodoc',
        logo: {
          alt: 'Bastodoc\'s logo',
          src: 'img/logo.png',
        },
        items: [
          {
          	to: '/docs/category/protocoles',
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {
          	href: 'https://bastienbonora.fr',
          	label: 'Portfolio',
          	position: 'left',
          },
          {
            href: 'https://github.com/fracorbas',
            label: 'Mon GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Système',
                to: '/docs/category/system',
              },
              {
              	label: 'Protocoles',
              	to: '/docs/category/protocoles',
              },
            ],
          },
          {
          	title: 'mes trucs à moi',
          	items: [
          		{
          			label: 'Portfolio',
          			href: 'https://bastienbonora.fr',
          		},
          		{
          			label: 'Blog',
          			to: '/blog',	
          		},
          		{
          			label: 'Portfolio gopher',
          			href: 'gopher://gopher.bastienbonora.fr',
          		},
          	],
          },
          {
            title: 'merci docusaurus',
            items: [
              {
                label: 'X',
                href: 'https://x.com/docusaurus',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus',
              },
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },  
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },                          
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Bastodoc, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      mermaid: {
          options: {
            theme: 'default', // ou 'dark', 'forest', 'neutral'
          },
        },
    }),
};

export default config;
