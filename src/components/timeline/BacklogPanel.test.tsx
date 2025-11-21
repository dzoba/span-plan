import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BacklogPanel from './BacklogPanel'
import type { TimelineItem } from '../../types'

const mockItems: TimelineItem[] = [
  {
    id: '1',
    rowId: null,
    title: 'Backlog Item 1',
    subtitle: 'Description 1',
    color: '#3B82F6',
    startDate: null,
    endDate: null,
  },
  {
    id: '2',
    rowId: null,
    title: 'Backlog Item 2',
    subtitle: '',
    color: '#10B981',
    startDate: null,
    endDate: null,
  },
]

describe('BacklogPanel', () => {
  const defaultProps = {
    items: mockItems,
    onAddItem: vi.fn(),
    onSelectItem: vi.fn(),
    onDragStart: vi.fn(),
    selectedItemId: null,
  }

  it('renders backlog header', () => {
    render(<BacklogPanel {...defaultProps} />)
    expect(screen.getByText('Backlog')).toBeInTheDocument()
  })

  it('renders all backlog items', () => {
    render(<BacklogPanel {...defaultProps} />)
    expect(screen.getByText('Backlog Item 1')).toBeInTheDocument()
    expect(screen.getByText('Backlog Item 2')).toBeInTheDocument()
  })

  it('renders item subtitles', () => {
    render(<BacklogPanel {...defaultProps} />)
    expect(screen.getByText('Description 1')).toBeInTheDocument()
  })

  it('shows empty state when no items', () => {
    render(<BacklogPanel {...defaultProps} items={[]} />)
    expect(screen.getByText('No unscheduled items')).toBeInTheDocument()
  })

  it('calls onSelectItem when item is clicked', async () => {
    const onSelectItem = vi.fn()
    render(<BacklogPanel {...defaultProps} onSelectItem={onSelectItem} />)

    await userEvent.click(screen.getByText('Backlog Item 1'))
    expect(onSelectItem).toHaveBeenCalledWith(mockItems[0])
  })

  it('highlights selected item', () => {
    render(<BacklogPanel {...defaultProps} selectedItemId="1" />)
    const item = screen.getByText('Backlog Item 1').closest('div[draggable="true"]')
    expect(item).toHaveClass('ring-2')
  })

  it('adds item when form is submitted with text', async () => {
    const onAddItem = vi.fn()
    render(<BacklogPanel {...defaultProps} onAddItem={onAddItem} />)

    const input = screen.getByPlaceholderText('Add item and press Enter')
    await userEvent.type(input, 'New Item{enter}')

    expect(onAddItem).toHaveBeenCalledWith('New Item')
  })

  it('clears input after adding item', async () => {
    const onAddItem = vi.fn()
    render(<BacklogPanel {...defaultProps} onAddItem={onAddItem} />)

    const input = screen.getByPlaceholderText('Add item and press Enter')
    await userEvent.type(input, 'New Item{enter}')

    expect(input).toHaveValue('')
  })

  it('does not add item when input is empty', async () => {
    const onAddItem = vi.fn()
    render(<BacklogPanel {...defaultProps} onAddItem={onAddItem} />)

    const input = screen.getByPlaceholderText('Add item and press Enter')
    await userEvent.type(input, '{enter}')

    expect(onAddItem).not.toHaveBeenCalled()
  })

  it('trims whitespace from input', async () => {
    const onAddItem = vi.fn()
    render(<BacklogPanel {...defaultProps} onAddItem={onAddItem} />)

    const input = screen.getByPlaceholderText('Add item and press Enter')
    await userEvent.type(input, '  New Item  {enter}')

    expect(onAddItem).toHaveBeenCalledWith('New Item')
  })

  it('items are draggable', () => {
    render(<BacklogPanel {...defaultProps} />)
    const item = screen.getByText('Backlog Item 1').closest('div[draggable="true"]')
    expect(item).toHaveAttribute('draggable', 'true')
  })
})
