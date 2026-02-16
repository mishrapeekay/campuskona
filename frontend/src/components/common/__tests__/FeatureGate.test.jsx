import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import FeatureGate from '../FeatureGate'

// Mock the useFeature and useSubscriptionTier hooks
const mockUseFeature = vi.fn()
const mockUseSubscriptionTier = vi.fn()

vi.mock('../../../hooks/useFeature', () => ({
  useFeature: (...args) => mockUseFeature(...args),
  useSubscriptionTier: (...args) => mockUseSubscriptionTier(...args),
}))

describe('FeatureGate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSubscriptionTier.mockReturnValue('BASIC')
  })

  it('renders children when feature is enabled', () => {
    mockUseFeature.mockReturnValue(true)
    render(
      <FeatureGate feature="test_feature">
        <div>Feature Content</div>
      </FeatureGate>
    )
    expect(screen.getByText('Feature Content')).toBeInTheDocument()
  })

  it('renders nothing when feature is disabled and no fallback', () => {
    mockUseFeature.mockReturnValue(false)
    const { container } = render(
      <FeatureGate feature="test_feature">
        <div>Feature Content</div>
      </FeatureGate>
    )
    expect(screen.queryByText('Feature Content')).not.toBeInTheDocument()
    expect(container.innerHTML).toBe('')
  })

  it('renders fallback when feature is disabled and fallback provided', () => {
    mockUseFeature.mockReturnValue(false)
    render(
      <FeatureGate feature="test_feature" fallback={<div>Upgrade Required</div>}>
        <div>Feature Content</div>
      </FeatureGate>
    )
    expect(screen.queryByText('Feature Content')).not.toBeInTheDocument()
    expect(screen.getByText('Upgrade Required')).toBeInTheDocument()
  })

  it('renders upgrade prompt when showUpgrade is true', () => {
    mockUseFeature.mockReturnValue(false)
    render(
      <FeatureGate feature="test_feature" showUpgrade>
        <div>Feature Content</div>
      </FeatureGate>
    )
    expect(screen.queryByText('Feature Content')).not.toBeInTheDocument()
    expect(screen.getByText('Premium Feature')).toBeInTheDocument()
  })
})
