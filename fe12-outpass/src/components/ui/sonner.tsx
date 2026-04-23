import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      richColors
      expand={true}
      toastOptions={{
        style: {
          background: 'white',
          color: '#1e293b',
          border: '1px solid #e2e8f0',
          borderRadius: '0.75rem',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
