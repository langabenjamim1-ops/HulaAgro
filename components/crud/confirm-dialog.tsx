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
      <div className="bg-white rounded border border-[#C7C2AB] max-w-md w-full font-montserrat">
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-[#C7C2AB]">
          <div className="flex items-center gap-3">
            <AlertCircle className={`w-5 h-5 ${isDangerous ? 'text-red-600' : 'text-[#283106]'}`} />
            <h2 className="text-sm sm:text-base font-bold text-[#283106]">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-[#F5F4F1] rounded"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-[#777E5C]" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-[#777E5C]">{message}</p>
        </div>

        <div className="flex gap-3 p-4 sm:p-6 border-t border-[#C7C2AB] justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs sm:text-sm border border-[#C7C2AB] text-[#283106] rounded hover:bg-[#F5F4F1] transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs sm:text-sm text-white rounded transition-colors disabled:opacity-50 ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#283106] hover:bg-[#1a1f04]'
            }`}
          >
            {isLoading ? 'Processando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
