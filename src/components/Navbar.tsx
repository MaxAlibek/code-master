import React, { useEffect, useState } from 'react'
import { Code2, Moon, Sun, Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LANGUAGE_STORAGE_KEY } from '../i18n'
import { applyTheme, getStoredTheme, ThemeMode } from '../utils/theme'

interface NavbarProps {
  onPrimaryAction: () => void
  onSecondaryAction: () => void
}

const Navbar: React.FC<NavbarProps> = ({ onPrimaryAction, onSecondaryAction }) => {
  const { t, i18n } = useTranslation()
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onThemeChange = (event: Event) => {
      const next = (event as CustomEvent<ThemeMode>).detail
      if (next === 'light' || next === 'dark') {
        setTheme(next)
      }
    }
    window.addEventListener('codemaster:theme-change', onThemeChange as EventListener)
    return () => window.removeEventListener('codemaster:theme-change', onThemeChange as EventListener)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
  }

  const changeLanguage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value
    localStorage.setItem(LANGUAGE_STORAGE_KEY, next)
    i18n.changeLanguage(next)
  }

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)
  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-3 py-3 sm:px-4 sm:py-4">
      <nav className="apple-glass mx-auto flex max-w-7xl items-center justify-between rounded-[20px] sm:rounded-[24px] px-3 py-2.5 sm:px-6 sm:py-3">
        <button
          type="button"
          onClick={onSecondaryAction}
          className="flex items-center gap-2 sm:gap-3 rounded-full text-left min-h-[44px]"
          aria-label={t('header.home')}
        >
          <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-[var(--app-text)] text-[var(--app-bg)] shadow-[0_10px_20px_rgba(0,0,0,0.08)]">
            <Code2 size={19} aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm sm:text-base font-bold tracking-[-0.02em] text-[var(--app-text)]">CodeMaster</span>
            <span className="mt-0.5 sm:mt-1 hidden text-[10px] sm:text-xs font-medium text-[var(--app-text-faint)] sm:inline">{t('header.subtitle')}</span>
          </span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 lg:gap-8 text-sm font-medium text-[var(--app-text-muted)] md:flex">
          <a className="transition-colors duration-300 hover:text-[var(--app-text)] min-h-[44px] flex items-center" href="#features">{t('header.features')}</a>
          <a className="transition-colors duration-300 hover:text-[var(--app-text)] min-h-[44px] flex items-center" href="#platform">{t('header.platform')}</a>
          <button type="button" className="primary-btn px-4 py-2.5 text-sm min-h-[44px]" onClick={onPrimaryAction}>{t('header.startLearning', { defaultValue: 'Start Learning' })}</button>
        </div>

        {/* Mobile: Hamburger + Controls */}
        <div className="flex items-center gap-2">
          <select
            className="theme-control text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2 min-h-[36px] sm:min-h-[40px]"
            value={i18n.language}
            onChange={changeLanguage}
            aria-label={t('header.language')}
          >
            <option value="en">EN</option>
            <option value="ru">RU</option>
            <option value="uz">UZ</option>
          </select>
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-control h-9 w-9 sm:h-10 sm:w-10 px-0 min-h-[36px] sm:min-h-[40px]"
            aria-label={theme === 'dark' ? t('header.themeLight') : t('header.themeDark')}
          >
            {theme === 'dark' ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
          </button>
          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="md:hidden theme-control h-9 w-9 sm:h-10 sm:w-10 px-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 mt-2 apple-glass rounded-[20px] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.2)] border border-[var(--app-border)]">
          <div className="flex flex-col gap-2">
            <a 
              className="flex items-center min-h-[44px] px-4 py-3 rounded-xl text-[var(--app-text)] font-medium hover:bg-[var(--app-surface-strong)] transition-colors" 
              href="#features"
              onClick={closeMobileMenu}
            >
              {t('header.features')}
            </a>
            <a 
              className="flex items-center min-h-[44px] px-4 py-3 rounded-xl text-[var(--app-text)] font-medium hover:bg-[var(--app-surface-strong)] transition-colors" 
              href="#platform"
              onClick={closeMobileMenu}
            >
              {t('header.platform')}
            </a>
            <button 
              type="button" 
              className="primary-btn w-full min-h-[44px] px-4 py-3 mt-2 text-sm font-semibold" 
              onClick={() => { closeMobileMenu(); onPrimaryAction(); }}
            >
              {t('header.startLearning', { defaultValue: 'Start Learning' })}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
