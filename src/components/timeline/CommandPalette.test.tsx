import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CommandPalette from './CommandPalette'
import type { TimelineItem } from '../../types'

const mockItems: TimelineItem[] = [
  {
    id: '1',
    rowId: 'row-1',
    title: 'Design Review',
    subtitle: 'Q4 Planning',
    color: '#3B82F6',
    startDate: '2024-06-01',
    endDate: '2024-06-07',
  },
  {
    id: '2',
    rowId: 'row-1',
    title: 'Development Sprint',
    subtitle: 'Feature work',
    color: '#10B981',
    startDate: '2024-06-08',
    endDate: '2024-06-21',
  },
  {
    id: '3',
    rowId: null,
    title: 'Backlog Task',
    subtitle: '',
    color: '#F59E0B',
    startDate: null,
    endDate: null,
  },
]

describe('CommandPalette', () => {
  it('does not render when closed', () => {
    const props = {
      items: mockItems,
      isOpen: false,
      onClose: vi.fn(),
      onSelectItem: vi.fn(),
    }
    render(<CommandPalette {...props} />)
    expect(screen.queryByPlaceholderText('Search items...')).not.toBeInTheDocument()
  })

  it('renders search input when open', () => {
    const props = {
      items: mockItems,
      isOpen: true,
      onClose: vi.fn(),
      onSelectItem: vi.fn(),
    }
    render(<CommandPalette {...props} />)
    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument()
  })

  it('shows all items when no query', () => {
    const props = {
      items: mockItems,
      isOpen: true,
      onClose: vi.fn(),
      onSelectItem: vi.fn(),
    }
    render(<CommandPalette {...props} />)
    expect(screen.getByText('Design Review')).toBeInTheDocument()
    expect(screen.getByText('Development Sprint')).toBeInTheDocument()
    expect(screen.getByText('Backlog Task')).toBeInTheDocument()
  })

  it('filters items by title', async () => {
    const props = {
      items: mockItems,
      isOpen: true,
      onClose: vi.fn(),
      onSelectItem: vi.fn(),
    }
    render(<CommandPalette {...props} />)

    const input = screen.getByPlaceholderText('Search items...')
    await userEvent.type(input, 'Design')

    expect(screen.getByText('Design Review')).toBeInTheDocument()
    expect(screen.queryByText('Development Sprint')).not.toBeInTheDocument()
    expect(screen.queryByText('Backlog Task')).not.toBeInTheDocument()
  })

  it('filters items by subtitle', async () => {
    const props = {
      items: mockItems,
      isOpen: true,
      onClose: vi.fn(),
      onSelectItem: vi.fn(),
    }
    render(<CommandPalette {...props} />)

    const input = screen.getByPlaceholderText('Search items...')
    await userEvent.type(input, 'Q4')

    expect(screen.getByText('Design Review')).toBeInTheDocument()
    expect(screen.queryByText('Development Sprint')).not.toBeInTheDocument()
  })

  it('shows "No items found" when no matches', async () => {
    const props = {
      items: mockItems,
      isOpen: true,
      onClose: vi.fn(),
      onSelectItem: vi.fn(),
    }
    render(<CommandPalette {...props} />)

    const input = screen.getByPlaceholderText('Search items...')
    await userEvent.type(input, 'xyz123')

    expect(screen.getByText('No items found')).toBeInTheDocument()
  })

  it('shows backlog label for unscheduled items', () => {
    const props = {
      items: mockItems,
      isOpen: true,
      onClose: vi.fn(),
      onSelectItem: vi.fn(),
    }
    render(<CommandPalette {...props} />)
    expect(screen.getByText('Backlog')).toBeInTheDocument()
  })

  it('calls onSelectItem when item is clicked', async () => {
    const onSelectItem = vi.fn()
    const props = {
      items: mockItems,
      isOpen: true,
      onClose: vi.fn(),
      onSelectItem,
    }
    render(<CommandPalette {...props} />)

    await userEvent.click(screen.getByText('Design Review'))
    expect(onSelectItem).toHaveBeenCalledWith(mockItems[0])
  })

  it('calls onClose when item is selected', async () => {
    const onClose = vi.fn()
    const props = {
      items: mockItems,
      isOpen: true,
      onClose,
      onSelectItem: vi.fn(),
    }
    render(<CommandPalette {...props} />)

    await userEvent.click(screen.getByText('Design Review'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    const props = {
      items: mockItems,
      isOpen: true,
      onClose,
      onSelectItem: vi.fn(),
    }
    render(<CommandPalette {...props} />)

    const input = screen.getByPlaceholderText('Search items...')
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(onClose).toHaveBeenCalled()
  })

  it('selects item with Enter key', () => {
    const onSelectItem = vi.fn()
    const props = {
      items: mockItems,
      isOpen: true,
      onClose: vi.fn(),
      onSelectItem,
    }
    render(<CommandPalette {...props} />)

    const input = screen.getByPlaceholderText('Search items...')
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSelectItem).toHaveBeenCalledWith(mockItems[0])
  })

  it('navigates with arrow keys', () => {
    const onSelectItem = vi.fn()
    const props = {
      items: mockItems,
      isOpen: true,
      onClose: vi.fn(),
      onSelectItem,
    }
    render(<CommandPalette {...props} />)

    const input = screen.getByPlaceholderText('Search items...')

    // Move down to second item
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSelectItem).toHaveBeenCalledWith(mockItems[1])
  })

  it('does not go below last item', () => {
    const onSelectItem = vi.fn()
    const props = {
      items: mockItems,
      isOpen: true,
      onClose: vi.fn(),
      onSelectItem,
    }
    render(<CommandPalette {...props} />)

    const input = screen.getByPlaceholderText('Search items...')

    // Try to go past the last item
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSelectItem).toHaveBeenCalledWith(mockItems[2])
  })

  it('does not go above first item', () => {
    const onSelectItem = vi.fn()
    const props = {
      items: mockItems,
      isOpen: true,
      onClose: vi.fn(),
      onSelectItem,
    }
    render(<CommandPalette {...props} />)

    const input = screen.getByPlaceholderText('Search items...')

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSelectItem).toHaveBeenCalledWith(mockItems[0])
  })

  it('is case insensitive', async () => {
    const props = {
      items: mockItems,
      isOpen: true,
      onClose: vi.fn(),
      onSelectItem: vi.fn(),
    }
    render(<CommandPalette {...props} />)

    const input = screen.getByPlaceholderText('Search items...')
    await userEvent.type(input, 'design')

    expect(screen.getByText('Design Review')).toBeInTheDocument()
  })
})
