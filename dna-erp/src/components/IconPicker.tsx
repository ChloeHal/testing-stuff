import {
  Star, Heart, Flame, Target, Compass, Anchor, Award, Bell,
  Bookmark, Box, Briefcase, Camera, Cloud, Coffee, Cpu, Crown,
  Diamond, Disc, Eye, Feather, Flag, Gift, Grid3X3, Hash,
  Hexagon, Home, Key, Layers, Lightbulb, Link, Lock, Map,
  Monitor, Music, Package, Palette, Pen, Phone, Plane, Plug,
  Radio, Rocket, Search, Settings, ShoppingCart, Smile, Speaker,
  Sun, Tag, Terminal, Thermometer, Truck, Umbrella, Video, Wifi,
  Wrench, type LucideIcon,
} from 'lucide-react'

const ICON_OPTIONS: { name: string; icon: LucideIcon }[] = [
  { name: 'Star', icon: Star },
  { name: 'Heart', icon: Heart },
  { name: 'Flame', icon: Flame },
  { name: 'Target', icon: Target },
  { name: 'Compass', icon: Compass },
  { name: 'Anchor', icon: Anchor },
  { name: 'Award', icon: Award },
  { name: 'Bell', icon: Bell },
  { name: 'Bookmark', icon: Bookmark },
  { name: 'Box', icon: Box },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Camera', icon: Camera },
  { name: 'Cloud', icon: Cloud },
  { name: 'Coffee', icon: Coffee },
  { name: 'Cpu', icon: Cpu },
  { name: 'Crown', icon: Crown },
  { name: 'Diamond', icon: Diamond },
  { name: 'Disc', icon: Disc },
  { name: 'Eye', icon: Eye },
  { name: 'Feather', icon: Feather },
  { name: 'Flag', icon: Flag },
  { name: 'Gift', icon: Gift },
  { name: 'Grid', icon: Grid3X3 },
  { name: 'Hash', icon: Hash },
  { name: 'Hexagon', icon: Hexagon },
  { name: 'Home', icon: Home },
  { name: 'Key', icon: Key },
  { name: 'Layers', icon: Layers },
  { name: 'Lightbulb', icon: Lightbulb },
  { name: 'Link', icon: Link },
  { name: 'Lock', icon: Lock },
  { name: 'Map', icon: Map },
  { name: 'Monitor', icon: Monitor },
  { name: 'Music', icon: Music },
  { name: 'Package', icon: Package },
  { name: 'Palette', icon: Palette },
  { name: 'Pen', icon: Pen },
  { name: 'Phone', icon: Phone },
  { name: 'Plane', icon: Plane },
  { name: 'Plug', icon: Plug },
  { name: 'Radio', icon: Radio },
  { name: 'Rocket', icon: Rocket },
  { name: 'Search', icon: Search },
  { name: 'Settings', icon: Settings },
  { name: 'Cart', icon: ShoppingCart },
  { name: 'Smile', icon: Smile },
  { name: 'Speaker', icon: Speaker },
  { name: 'Sun', icon: Sun },
  { name: 'Tag', icon: Tag },
  { name: 'Terminal', icon: Terminal },
  { name: 'Thermo', icon: Thermometer },
  { name: 'Truck', icon: Truck },
  { name: 'Umbrella', icon: Umbrella },
  { name: 'Video', icon: Video },
  { name: 'Wifi', icon: Wifi },
  { name: 'Wrench', icon: Wrench },
]

export { ICON_OPTIONS }

interface IconPickerProps {
  selected: string
  onSelect: (name: string) => void
}

export default function IconPicker({ selected, onSelect }: IconPickerProps) {
  return (
    <div>
      <p style={{
        fontSize: 13,
        color: 'hsl(var(--muted-foreground))',
        marginBottom: 8,
      }}>
        Icône
      </p>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        maxHeight: 110,
        overflowY: 'auto',
      }}>
        {ICON_OPTIONS.map(({ name, icon: Icon }) => (
          <button
            key={name}
            onClick={() => onSelect(name)}
            style={{
              width: 32,
              height: 32,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'calc(var(--radius) - 2px)',
              border: selected === name
                ? '1px solid hsl(var(--ring))'
                : '1px solid transparent',
              background: selected === name
                ? 'hsl(var(--accent))'
                : 'transparent',
              color: selected === name
                ? 'hsl(var(--foreground))'
                : 'hsl(var(--muted-foreground))',
              cursor: 'pointer',
              padding: 0,
            }}
            title={name}
          >
            <Icon size={14} strokeWidth={1.5} />
          </button>
        ))}
      </div>
    </div>
  )
}
