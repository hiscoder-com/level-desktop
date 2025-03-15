import toast from 'react-hot-toast'

export function showToastWarning(message, duration = 5000) {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } pointer-events-auto flex w-64 items-center space-x-3 rounded-lg bg-white px-4 py-3 shadow-lg`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{ color: 'orange' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.29 3.86l-8.47 14.14a2 2 0 001.71 3h16.94a2 2 0 001.71-3l-8.47-14.14a2 2 0 00-3.42 0zm1.71 5.14v4m0 4h.01"
          />
        </svg>
        <span className="text-left">{message}</span>
      </div>
    ),
    { duration: duration }
  )
}

export const showToastWarningWithBlock = (message, duration, block) => {
  return new Promise((resolve) => {
    showToastWarning(message, duration)
    if (block) {
      setTimeout(() => resolve(), duration)
    } else {
      resolve()
    }
  })
}
