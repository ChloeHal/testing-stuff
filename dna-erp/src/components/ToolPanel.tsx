import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ArrowRight } from 'lucide-react'
import type { Tool } from '../types'
import IconPicker from './IconPicker'

interface ToolPanelProps {
  allTools: Tool[]
  activeToolIds: string[]
  onToggle: (toolId: string) => void
  onCreateTool: (name: string, iconName: string) => void
}

export default function ToolPanel({ allTools, activeToolIds, onToggle, onCreateTool }: ToolPanelProps) {
  const [showCreator, setShowCreator] = useState(false)
  const [newName, setNewName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('')

  const handleDragStart = (e: React.DragEvent, toolId: string) => {
    e.dataTransfer.setData('toolId', toolId)
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleCreate = () => {
    if (newName.trim() && selectedIcon) {
      onCreateTool(newName.trim(), selectedIcon)
      setNewName('')
      setSelectedIcon('')
      setShowCreator(false)
    }
  }

  return (
    <div style={{
      width: 300,
      flexShrink: 0,
      borderRight: '1px solid hsl(var(--border))',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 16px' }}>
        <p style={{
          fontSize: 13,
          color: 'hsl(var(--muted-foreground))',
          marginBottom: 12,
        }}>
          Sélectionnez vos outils
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {allTools.map(tool => {
            const isActive = activeToolIds.includes(tool.id)
            const Icon = tool.icon
            return (
              <motion.button
                key={tool.id}
                draggable={!isActive}
                onDragStart={!isActive ? (e: any) => handleDragStart(e, tool.id) : undefined}
                onClick={() => onToggle(tool.id)}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  height: 36,
                  padding: '0 10px',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'calc(var(--radius) - 2px)',
                  background: isActive ? 'hsl(var(--accent))' : 'transparent',
                  color: isActive ? 'hsl(var(--accent-foreground))' : 'hsl(var(--muted-foreground))',
                  cursor: !isActive ? 'grab' : 'pointer',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                <Icon size={14} strokeWidth={1.5} />
                <span style={{ flex: 1 }}>{tool.name}</span>
                {isActive && <X size={12} style={{ opacity: 0.5 }} />}
              </motion.button>
            )
          })}

          <button
            onClick={() => setShowCreator(!showCreator)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              height: 36,
              padding: '0 10px',
              border: '1px dashed hsl(var(--border))',
              borderRadius: 'calc(var(--radius) - 2px)',
              background: 'transparent',
              color: 'hsl(var(--muted-foreground))',
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: 'inherit',
              textAlign: 'left',
            }}
          >
            <Plus size={14} strokeWidth={1.5} />
            Créer un outil
          </button>
        </div>

        <AnimatePresence>
          {showCreator && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                marginTop: 8,
                padding: 12,
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                <input
                  type="text"
                  placeholder="Nom de l'outil"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  style={{
                    height: 36,
                    padding: '0 10px',
                    border: '1px solid hsl(var(--input))',
                    borderRadius: 'calc(var(--radius) - 2px)',
                    background: 'transparent',
                    color: 'hsl(var(--foreground))',
                    fontSize: 13,
                    fontFamily: 'inherit',
                    outline: 'none',
                    width: '100%',
                  }}
                />
                <IconPicker selected={selectedIcon} onSelect={setSelectedIcon} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={handleCreate}
                    disabled={!newName.trim() || !selectedIcon}
                    style={{
                      height: 32,
                      padding: '0 14px',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'calc(var(--radius) - 2px)',
                      background: newName.trim() && selectedIcon ? 'hsl(var(--foreground))' : 'transparent',
                      color: newName.trim() && selectedIcon ? 'hsl(var(--background))' : 'hsl(var(--muted-foreground))',
                      cursor: newName.trim() && selectedIcon ? 'pointer' : 'default',
                      fontSize: 13,
                      fontFamily: 'inherit',
                    }}
                  >
                    Ajouter
                  </button>
                  <button
                    onClick={() => setShowCreator(false)}
                    style={{
                      height: 32,
                      padding: '0 14px',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'calc(var(--radius) - 2px)',
                      background: 'transparent',
                      color: 'hsl(var(--muted-foreground))',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontFamily: 'inherit',
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ padding: '16px' }}>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            height: 40,
            border: 'none',
            borderRadius: 'var(--radius)',
            background: 'hsl(var(--foreground))',
            color: 'hsl(var(--background))',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            fontFamily: 'inherit',
          }}
        >
          Étape suivante
          <ArrowRight size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
