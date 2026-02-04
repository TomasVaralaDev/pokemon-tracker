import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Toast } from './Toast';

describe('Toast Component', () => {
  it('renders the message', () => {
    render(<Toast message="Test Message" onClose={() => {}} />);
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('shows correct style for success', () => {
    render(<Toast message="Success" type="success" onClose={() => {}} />);
    // Etsitään elementti tekstin perusteella ja tarkistetaan luokka
    expect(screen.getByText('Success')).toHaveClass('bg-green-100');
  });
});