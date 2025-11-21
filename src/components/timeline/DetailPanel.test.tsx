import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DetailPanel from './DetailPanel'
import type { TimelineItem } from '../../types'

const mockScheduledItem: TimelineItem = {
  id: '1',
  rowId: 'row-1',
  title: 'Test Item',
  subtitle: 'Test Description',
  color: '#3B82F6',
  startDate: '2024-06-01',
  endDate: '2024-06-07',
}

const mockBacklogItem: TimelineItem = {
  id: '2',
  rowId: null,
  title: 'Backlog Item',
  subtitle: '',
  color: '#10B981',
  startDate: null,
  endDate: null,
}

describe('DetailPanel', () => {
  const defaultProps = {
    item: mockScheduledItem,
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    onClose: vi.fn(),
  }

  it('renders item details header', () => {
    render(<DetailPanel {...defaultProps} />)
    expect(screen.getByText('Item Details')).toBeInTheDocument()
  })

  it('displays item title', () => {
    render(<DetailPanel {...defaultProps} />)
    const titleInput = screen.getByDisplayValue('Test Item')
    expect(titleInput).toBeInTheDocument()
  })

  it('displays item subtitle', () => {
    render(<DetailPanel {...defaultProps} />)
    const subtitleInput = screen.getByDisplayValue('Test Description')
    expect(subtitleInput).toBeInTheDocument()
  })

  it('displays date fields for scheduled items', () => {
    render(<DetailPanel {...defaultProps} />)
    expect(screen.getByText('Start Date')).toBeInTheDocument()
    expect(screen.getByText('End Date')).toBeInTheDocument()
  })

  it('displays "Move to Backlog" button for scheduled items', () => {
    render(<DetailPanel {...defaultProps} />)
    expect(screen.getByText('Move to Backlog')).toBeInTheDocument()
  })

  it('shows backlog message for backlog items', () => {
    render(<DetailPanel {...defaultProps} item={mockBacklogItem} />)
    expect(screen.getByText(/This item is in the backlog/)).toBeInTheDocument()
  })

  it('does not show date fields for backlog items', () => {
    render(<DetailPanel {...defaultProps} item={mockBacklogItem} />)
    expect(screen.queryByText('Start Date')).not.toBeInTheDocument()
    expect(screen.queryByText('End Date')).not.toBeInTheDocument()
  })

  it('does not show "Move to Backlog" button for backlog items', () => {
    render(<DetailPanel {...defaultProps} item={mockBacklogItem} />)
    expect(screen.queryByText('Move to Backlog')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    render(<DetailPanel {...defaultProps} onClose={onClose} />)

    // Find the close button by looking for the SVG with X pattern
    const buttons = screen.getAllByRole('button')
    const closeButton = buttons.find(btn =>
      btn.querySelector('path[d*="M6 18L18 6M6 6l12 12"]')
    )
    expect(closeButton).toBeDefined()
    await userEvent.click(closeButton!)
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onUpdate when title is changed', async () => {
    const onUpdate = vi.fn()
    render(<DetailPanel {...defaultProps} onUpdate={onUpdate} />)

    const titleInput = screen.getByDisplayValue('Test Item')
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'New Title')
    fireEvent.blur(titleInput)

    expect(onUpdate).toHaveBeenCalledWith('1', expect.objectContaining({
      title: 'New Title',
    }))
  })

  it('defaults to "Untitled" if title is empty', async () => {
    const onUpdate = vi.fn()
    render(<DetailPanel {...defaultProps} onUpdate={onUpdate} />)

    const titleInput = screen.getByDisplayValue('Test Item')
    await userEvent.clear(titleInput)
    fireEvent.blur(titleInput)

    expect(onUpdate).toHaveBeenCalledWith('1', expect.objectContaining({
      title: 'Untitled',
    }))
  })

  it('calls onDelete and onClose when delete button is clicked', async () => {
    const onDelete = vi.fn()
    const onClose = vi.fn()
    render(<DetailPanel {...defaultProps} onDelete={onDelete} onClose={onClose} />)

    const deleteButton = screen.getByText('Delete Item')
    await userEvent.click(deleteButton)

    expect(onDelete).toHaveBeenCalledWith('1')
    expect(onClose).toHaveBeenCalled()
  })

  it('displays color picker with all colors', () => {
    render(<DetailPanel {...defaultProps} />)
    // There should be 8 color buttons
    const colorButtons = screen.getAllByRole('button').filter(
      btn => btn.classList.contains('rounded-full') && btn.classList.contains('w-8')
    )
    expect(colorButtons).toHaveLength(8)
  })

  it('calls onUpdate when color is selected', async () => {
    const onUpdate = vi.fn()
    render(<DetailPanel {...defaultProps} onUpdate={onUpdate} />)

    // Find a color button (not the selected one)
    const colorButtons = screen.getAllByRole('button').filter(
      btn => btn.classList.contains('rounded-full') && btn.classList.contains('w-8')
    )
    await userEvent.click(colorButtons[1])

    expect(onUpdate).toHaveBeenCalledWith('1', expect.objectContaining({
      color: expect.any(String),
    }))
  })

  it('calls onUpdate with null dates when "Move to Backlog" is clicked', async () => {
    const onUpdate = vi.fn()
    render(<DetailPanel {...defaultProps} onUpdate={onUpdate} />)

    const moveToBacklogBtn = screen.getByText('Move to Backlog')
    await userEvent.click(moveToBacklogBtn)

    expect(onUpdate).toHaveBeenCalledWith('1', {
      rowId: null,
      startDate: null,
      endDate: null,
    })
  })

  it('updates when item prop changes', () => {
    const { rerender } = render(<DetailPanel {...defaultProps} />)
    expect(screen.getByDisplayValue('Test Item')).toBeInTheDocument()

    const newItem = { ...mockScheduledItem, title: 'Updated Title' }
    rerender(<DetailPanel {...defaultProps} item={newItem} />)
    expect(screen.getByDisplayValue('Updated Title')).toBeInTheDocument()
  })
})
