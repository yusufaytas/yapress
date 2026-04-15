'use client'

import { useState, FormEvent } from "react"

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

interface ContactFormProps {
  action?: string
}

export function ContactForm({ action = '/api/contact' }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setStatus('submitting')
    setErrorMessage('')

    try {
      const response = await fetch(action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || 'Failed to send message')
      }

      setStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setErrors({})
    } catch (error) {
      setStatus('error')
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'Something went wrong. Please try again later.'
      )
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  return (
    <div className="contact-form-wrapper">
      <form onSubmit={handleSubmit} className="contact-form" noValidate>
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`form-input ${errors.name ? 'form-input--error' : ''}`}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            disabled={status === 'submitting'}
          />
          {errors.name && (
            <span id="name-error" className="form-error" role="alert">
              {errors.name}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email <span className="required">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`form-input ${errors.email ? 'form-input--error' : ''}`}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            disabled={status === 'submitting'}
          />
          {errors.email && (
            <span id="email-error" className="form-error" role="alert">
              {errors.email}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="subject" className="form-label">
            Subject <span className="required">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={`form-input ${errors.subject ? 'form-input--error' : ''}`}
            aria-invalid={!!errors.subject}
            aria-describedby={errors.subject ? 'subject-error' : undefined}
            disabled={status === 'submitting'}
          />
          {errors.subject && (
            <span id="subject-error" className="form-error" role="alert">
              {errors.subject}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="message" className="form-label">
            Message <span className="required">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={6}
            className={`form-textarea ${errors.message ? 'form-input--error' : ''}`}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'message-error' : undefined}
            disabled={status === 'submitting'}
          />
          {errors.message && (
            <span id="message-error" className="form-error" role="alert">
              {errors.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="form-submit"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Sending...' : 'Send Message'}
        </button>

        {status === 'success' && (
          <div className="form-message form-message--success" role="status">
            Thank you for your message! We&apos;ll get back to you soon.
          </div>
        )}

        {status === 'error' && (
          <div className="form-message form-message--error" role="alert">
            {errorMessage}
          </div>
        )}
      </form>

      <style jsx>{`
        .contact-form-wrapper {
          max-width: 100%;
          margin: 2rem 0;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text);
          letter-spacing: 0.01em;
        }

        .required {
          color: var(--accent);
        }

        .form-input,
        .form-textarea {
          padding: 0.85rem 1rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 1rem;
          font-family: var(--font-sans);
          background: var(--surface);
          color: var(--text);
          transition: border-color 200ms ease, box-shadow 200ms ease, background-color 200ms ease;
          line-height: 1.5;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
          background: color-mix(in srgb, var(--surface) 95%, white 5%);
        }

        .form-input--error {
          border-color: var(--accent);
          background: color-mix(in srgb, var(--accent) 5%, var(--surface));
        }

        .form-input--error:focus {
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
        }

        .form-input:disabled,
        .form-textarea:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: color-mix(in srgb, var(--surface) 85%, var(--border) 15%);
        }

        .form-textarea {
          resize: vertical;
          min-height: 140px;
          font-family: var(--font-sans);
        }

        .form-error {
          color: var(--accent);
          font-size: 0.88rem;
          margin-top: -0.25rem;
          font-weight: 500;
        }

        .form-submit {
          padding: 0.95rem 1.75rem;
          background: var(--accent);
          color: var(--bg);
          border: 1px solid var(--accent);
          border-radius: var(--radius-sm);
          font-size: 1rem;
          font-weight: 600;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 200ms ease;
          letter-spacing: 0.02em;
          align-self: flex-start;
        }

        .form-submit:hover:not(:disabled) {
          background: color-mix(in srgb, var(--accent) 85%, black 15%);
          border-color: color-mix(in srgb, var(--accent) 85%, black 15%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px color-mix(in srgb, var(--accent) 30%, transparent);
        }

        .form-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .form-message {
          padding: 1rem 1.25rem;
          border-radius: var(--radius-sm);
          font-size: 0.95rem;
          line-height: 1.6;
          border: 1px solid;
        }

        .form-message--success {
          background: color-mix(in srgb, var(--accent) 10%, var(--surface));
          color: var(--text);
          border-color: color-mix(in srgb, var(--accent) 30%, var(--border));
        }

        .form-message--error {
          background: color-mix(in srgb, var(--accent) 15%, var(--surface));
          color: var(--text);
          border-color: var(--accent);
        }

        @media (max-width: 768px) {
          .contact-form-wrapper {
            margin: 1.5rem 0;
          }

          .contact-form {
            gap: 1.25rem;
          }

          .form-input,
          .form-textarea {
            padding: 0.75rem 0.9rem;
            font-size: 1rem;
          }

          .form-submit {
            width: 100%;
            padding: 0.85rem 1.5rem;
          }

          .form-message {
            padding: 0.9rem 1rem;
            font-size: 0.92rem;
          }
        }
      `}</style>
    </div>
  )
}
