import { useState, useCallback, useMemo } from 'react'
import {
  ClipboardList, Banknote, Scale, Calendar, BookOpen,
  MessageCircle, FolderOpen, Users, GanttChart, Zap,
  Shield, BarChart3, Mail, Globe, Headphones, Database
} from 'lucide-react'
import type { Tool } from './types'
import { ICON_OPTIONS } from './components/IconPicker'
import DnaHelix from './components/DnaHelix'
import ToolPanel from './components/ToolPanel'

const DEFAULT_TOOLS: Tool[] = [
  { id: 'project', name: 'Gestion de projet', icon: ClipboardList },
  { id: 'finance', name: 'Finance', icon: Banknote },
  { id: 'legal', name: 'Juridique', icon: Scale },
  { id: 'agenda', name: 'Agenda', icon: Calendar },
  { id: 'wiki', name: 'Wiki', icon: BookOpen },
  { id: 'communication', name: 'Communication', icon: MessageCircle },
  { id: 'storage', name: 'Documents', icon: FolderOpen },
  { id: 'crm', name: 'CRM', icon: Users },
  { id: 'planning', name: 'Planification', icon: GanttChart },
  { id: 'automation', name: 'Automatisation', icon: Zap },
  { id: 'security', name: 'Sécurité', icon: Shield },
  { id: 'analytics', name: 'Analytique', icon: BarChart3 },
  { id: 'email', name: 'Email', icon: Mail },
  { id: 'website', name: 'Site web', icon: Globe },
  { id: 'support', name: 'Support', icon: Headphones },
  { id: 'data', name: 'Base de données', icon: Database },
]

const NUM_RUNGS = 18

function computeAssignments(numRungs: number, activeToolIds: string[]): { a: string; b: string }[] {
  const n = activeToolIds.length
  if (n === 0) return Array.from({ length: numRungs }, () => ({ a: '', b: '' }))
  if (n === 1) return Array.from({ length: numRungs }, () => ({
    a: activeToolIds[0],
    b: activeToolIds[0],
  }))

  const pairs: { a: string; b: string }[] = []
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      pairs.push(
        (i + j) % 2 === 0
          ? { a: activeToolIds[i], b: activeToolIds[j] }
          : { a: activeToolIds[j], b: activeToolIds[i] },
      )
    }
  }

  return Array.from({ length: numRungs }, (_, i) => pairs[i % pairs.length])
}

export default function App() {
  const [allTools, setAllTools] = useState<Tool[]>(DEFAULT_TOOLS)
  const [activeToolIds, setActiveToolIds] = useState<string[]>([])

  const toolMap = useMemo(() => new Map(allTools.map(t => [t.id, t])), [allTools])

  const assignments = useMemo(
    () => computeAssignments(NUM_RUNGS, activeToolIds),
    [activeToolIds],
  )

  const toggleTool = useCallback((toolId: string) => {
    setActiveToolIds(prev =>
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    )
  }, [])

  const handleDropTool = useCallback((toolId: string) => {
    setActiveToolIds(prev =>
      prev.includes(toolId) ? prev : [...prev, toolId]
    )
  }, [])

  const handleCreateTool = useCallback((name: string, iconName: string) => {
    const iconOption = ICON_OPTIONS.find(o => o.name === iconName)
    if (!iconOption) return
    const id = `custom-${Date.now()}`
    const newTool: Tool = { id, name, icon: iconOption.icon }
    setAllTools(prev => [...prev, newTool])
    setActiveToolIds(prev => [...prev, id])
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: 'hsl(var(--background))' }}>
      <ToolPanel
        allTools={allTools}
        activeToolIds={activeToolIds}
        onToggle={toggleTool}
        onCreateTool={handleCreateTool}
      />
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <DnaHelix
          assignments={assignments}
          numRungs={NUM_RUNGS}
          toolMap={toolMap}
          onClickBall={toggleTool}
          onDropTool={handleDropTool}
        />
      </div>
    </div>
  )
}
