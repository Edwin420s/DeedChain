import Head from 'next/head'

const SEOHead = ({ 
  title = 'DeedChain - Land Ownership & Tokenization Platform',
  description = 'DeedChain brings transparency and security to property ownership through blockchain technology. Register, verify, and tokenize land deeds as NFTs.',
  keywords = 'blockchain, real estate, property, land ownership, nft, tokenization, deedchain',
  ogImage = '/images/og-image.jpg',
  url = 'https://deedchain.com',
  canonical = ''
}) => {
  const siteTitle = 'DeedChain - Land Ownership & Tokenization Platform'
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`
  const fullUrl = canonical ? `https://deedchain.com${canonical}` : url

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="DeedChain" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@deedchain" />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#0A192F" />
      <meta name="msapplication-TileColor" content="#0A192F" />

      {/* Favicon Links */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "DeedChain",
            "url": "https://deedchain.com",
            "logo": "https://deedchain.com/images/logo.png",
            "description": description,
            "sameAs": [
              "https://twitter.com/deedchain",
              "https://github.com/deedchain",
              "https://discord.gg/deedchain"
            ]
          })
        }}
      />
    </Head>
  )
}

export default SEOHead