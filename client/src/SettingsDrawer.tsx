import { useEffect, useRef, useState } from 'react'

type Setting = {
  setting_key: string
  setting_value: string
  label: string
  description: string
}

type Props = {
  open: boolean
  onClose: () => void
  onTitleChange: (title: string) => void
}

export default function SettingsDrawer({ open, onClose, onTitleChange }: Props) {
  const [settings, setSettings] = useState<Setting[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data: Setting[]) => {
        setSettings(data)
        setValues(Object.fromEntries(data.map((s) => [s.setting_key, s.setting_value ?? ''])))
      })
      .catch(() => {})
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSave() {
    setSaving(true)
    try {
      await Promise.all(
        settings.map((s) =>
          fetch(`/api/settings/${encodeURIComponent(s.setting_key)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: values[s.setting_key] ?? '' }),
          })
        )
      )
      const title = values['APP_TITLE']
      if (title) onTitleChange(title)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop ${open ? 'drawer-backdrop--open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`drawer ${open ? 'drawer--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
      >
        <div className="drawer-header">
          <h2 className="drawer-title">Settings</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close settings">
            <CloseIcon />
          </button>
        </div>

        <div className="drawer-body">
          {settings.length === 0 ? (
            <p className="drawer-empty">Loading settings…</p>
          ) : (
            settings.map((s) => (
              <div className="setting-field" key={s.setting_key}>
                <label className="setting-label" htmlFor={s.setting_key}>
                  {s.label}
                </label>
                {s.description && (
                  <p className="setting-description">{s.description}</p>
                )}
                <input
                  id={s.setting_key}
                  className="setting-input"
                  type="text"
                  value={values[s.setting_key] ?? ''}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [s.setting_key]: e.target.value }))
                  }
                />
              </div>
            ))
          )}
        </div>

        <div className="drawer-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
          </button>
        </div>
      </div>
    </>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
