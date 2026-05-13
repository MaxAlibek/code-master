import React from 'react'
import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  accent?: 'blue' | 'green' | 'dark'
  preview?: string
}

const accentClassName = {
  blue: 'bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/10',
  green: 'bg-[#34C759]/10 text-[#34C759] border-[#34C759]/10',
  dark: 'bg-black/5 text-black border-black/5'
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, accent = 'blue', preview }) => {
  return (
    <motion.article
      className="group cursor-pointer rounded-2xl border border-black/5 bg-white p-6 shadow-[0_10px_20px_rgba(0,0,0,0.04)] hover:border-[#34C759] hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)]"
      tabIndex={0}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      style={{ willChange: 'transform' }}
    >
      <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border ${accentClassName[accent]} transition-transform duration-300 group-hover:scale-105`}>
        <Icon size={24} aria-hidden="true" />
      </div>
      <h3 className="text-xl font-bold leading-[1.1] tracking-[-0.02em] text-black">{title}</h3>
      <p className="mt-3 text-base leading-7 text-black/60">{description}</p>
      {preview && (
        <div className="mt-5 max-h-0 overflow-hidden rounded-2xl border border-[#007AFF]/10 bg-[#F5F5F7] p-0 text-sm font-semibold text-black/70 opacity-0 transition-all duration-300 group-hover:max-h-32 group-hover:p-4 group-hover:opacity-100 group-focus:max-h-32 group-focus:p-4 group-focus:opacity-100">
          {preview}
        </div>
      )}
    </motion.article>
  )
}

export default FeatureCard
