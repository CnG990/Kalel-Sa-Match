import Image from 'next/image'

export default function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`} suppressHydrationWarning>
      <Image
        src="/images/logo.png"
        alt="Kalèl sa Match"
        width={120}
        height={40}
        className="h-full w-auto"
        priority
      />
    </div>
  )
} 