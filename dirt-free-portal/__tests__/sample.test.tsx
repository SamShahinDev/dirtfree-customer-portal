import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Sample component for testing
function SampleComponent() {
  return <div>Hello, Testing!</div>
}

describe('Sample Test', () => {
  it('renders without crashing', () => {
    render(<SampleComponent />)
    expect(screen.getByText('Hello, Testing!')).toBeInTheDocument()
  })

  it('performs a simple assertion', () => {
    expect(1 + 1).toBe(2)
  })
})
