'use client'

import { AlertCircle, X } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
  isDangerous?: boolean
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  onConfirm,
  onCancel,
  isDangerous = false
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded border border-[#C9D4D1] max-w-md w-full font-montserrat">
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-[#C9D4D1]">
          <div className="flex items-center gap-3">
            <AlertCircle className={`w-5 h-5 ${isDangerous ? 'text-red-600' : 'text-[#515062]'}`} />
            <h2 className="text-sm sm:text-base font-bold text-[#515062]">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-[#F9F9F9] rounded"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-[#7D8B89]" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-[#7D8B89]">{message}</p>
        </div>

        <div className="flex gap-3 p-4 sm:p-6 border-t border-[#C9D4D1] justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs sm:text-sm border border-[#C9D4D1] text-[#515062] rounded hover:bg-[#F9F9F9] transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs sm:text-sm text-white rounded transition-colors disabled:opacity-50 ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#515062] hover:bg-[#3F3E4D]'
            }`}
          >
            {isLoading ? 'Processando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
