import React from 'react';
import { Platform } from 'react-native';

type Props = {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
};

const SITE_NAME = 'CosmicSelf';
const DEFAULT_OG = 'https://cosmicself.app/og-default.png';

export function SEOHead(props: Props) {
  if (Platform.OS !== 'web') return null;
  const { title, description, canonical, ogImage = DEFAULT_OG, noindex, type = 'website' } = props;
  const fullTitle = title.endsWith(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      {noindex ? <meta name="robots" content="noindex,nofollow" /> : <meta name="robots" content="index,follow" />}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage} />
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </>
  );
}
