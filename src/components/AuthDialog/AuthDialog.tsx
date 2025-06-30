import { useState } from "react"
import Login from "./Login"
import Registr from "./Registr"

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const [authType, setAuthType] = useState<'login' | 'register'>('login')

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <button
              onClick={() => setAuthType('login')}
              className={`px-4 py-2 ${authType === 'login' ? 'font-bold text-blue-600' : 'text-gray-600'}`}
            >
              Kirish
            </button>
            <button
              onClick={() => setAuthType('register')}
              className={`px-4 py-2 ${authType === 'register' ? 'font-bold text-blue-600' : 'text-gray-600'}`}
            >
              Ro'yxatdan o'tish
            </button>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            X
          </button>
        </div>
        {authType === 'login' ? (
          <Login isDialog={true} onAuthSuccess={onClose} />
        ) : (
          <Registr isDialog={true} onAuthSuccess={onClose} />
        )}
      </div>
    </div>
  )
}

export default AuthDialog
