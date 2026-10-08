/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('Sentiment Intelligence Platform', () => {
  it('renders top bar brand and default Analyze view', () => {
    render(<App />);
    expect(screen.getByText(/Sentiment Analysis Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/English Text Input/i)).toBeInTheDocument();
  });

  it('navigates to Batch Analysis tab when clicked', () => {
    render(<App />);
    const batchTab = screen.getByRole('button', { name: /Batch Analysis/i });
    fireEvent.click(batchTab);
    expect(screen.getByText(/Batch Input Source/i)).toBeInTheDocument();
  });

  it('navigates to Model Performance tab when clicked', async () => {
    render(<App />);
    const perfTab = screen.getByRole('button', { name: /Model Performance/i });
    fireEvent.click(perfTab);

    expect(screen.getByText(/Model Benchmark & Evaluation/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Per-Class Evaluation Breakdown/i)).toBeInTheDocument();
    });
  });

  it('navigates to Documentation tab when clicked', () => {
    render(<App />);
    const docsTab = screen.getByRole('button', { name: /Documentation/i });
    fireEvent.click(docsTab);
    expect(screen.getByText(/Interactive Request Generator/i)).toBeInTheDocument();
  });
});
