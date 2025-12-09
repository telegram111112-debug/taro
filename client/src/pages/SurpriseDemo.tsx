import { useState } from 'react'
import { motion } from 'framer-motion'
import { SurpriseCardModal } from '../components/SurpriseCardModal'
import { Button } from '../components/ui/Button'
import { useUserStore } from '../store/useUserStore'

export function SurpriseDemo() {
  const [showModal, setShowModal] = useState(false)
  const { user } = useUserStore()
  const isFairyTheme = user?.deckTheme === 'fairy'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center -z-10"
        style={{
          backgroundImage: `url(${isFairyTheme ? '/backgrounds/background-fairy.jpg' : '/backgrounds/background-witch.jpg'})`,
        }}
      />
      <div className="fixed inset-0 bg-black/40 -z-10" />

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`text-3xl font-display font-bold mb-4 ${
          isFairyTheme ? 'text-[#FC89AC]' : 'text-purple-300'
        }`}>
          Демо: Сюрприз-карта
        </h1>
        <p className="text-white/70 mb-8 max-w-md">
          Эта карта будет случайно появляться у пользователей 1 раз за 50 дней.
          Нажми кнопку, чтобы увидеть эффект!
        </p>

        <Button
          onClick={() => setShowModal(true)}
          variant={isFairyTheme ? 'glass-fairy' : 'glass-witch'}
          size="lg"
        >
          Показать сюрприз-карту
        </Button>
      </motion.div>

      <SurpriseCardModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  )
}
