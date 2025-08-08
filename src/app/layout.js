import './globals.css'
import Head from 'next/head'

export const metadata = {
  title: 'Neuron — Brain Trainer',
  description: 'Short-term memory training game built with Next.js and Tailwind CSS'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <body className="bg-white text-slate-800 antialiased">
        {children}
      </body>
    </html>
  )
}
