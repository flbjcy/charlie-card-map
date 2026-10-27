import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'CharlieCardHunt — sightings map',description:'Find collectible MBTA CharlieCards with a community map of station sightings, machine details, and fresh reports.',icons:{icon:'/charlie.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
