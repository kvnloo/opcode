import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppStoragePane } from '@/components/mobile/workspace/panes/AppStoragePane';

describe('AppStoragePane', () => {
  it('renders app storage header', () => {
    render(<AppStoragePane />);
    expect(screen.getByText('App Storage')).toBeInTheDocument();
  });

  it('displays storage statistics', () => {
    render(<AppStoragePane />);
    expect(screen.getByText(/Storage used/)).toBeInTheDocument();
    expect(screen.getByText(/10 GB/)).toBeInTheDocument();
  });

  it('displays uploaded files', () => {
    render(<AppStoragePane />);
    expect(screen.getByText('avatar.png')).toBeInTheDocument();
    expect(screen.getByText('demo.mp4')).toBeInTheDocument();
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
  });

  it('shows file sizes', () => {
    render(<AppStoragePane />);
    const kbElements = screen.getAllByText(/KB/);
    const mbElements = screen.getAllByText(/MB/);
    expect(kbElements.length).toBeGreaterThan(0);
    expect(mbElements.length).toBeGreaterThan(0);
  });

  it('has upload button', () => {
    render(<AppStoragePane />);
    expect(screen.getByLabelText('Upload file')).toBeInTheDocument();
  });

  it('has download buttons for each file', () => {
    render(<AppStoragePane />);
    const downloadButtons = screen.getAllByLabelText('Download');
    expect(downloadButtons.length).toBeGreaterThan(0);
  });

  it('has delete buttons for each file', () => {
    render(<AppStoragePane />);
    const deleteButtons = screen.getAllByLabelText('Delete');
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('displays upload area', () => {
    render(<AppStoragePane />);
    expect(screen.getByText('Drag and drop files here')).toBeInTheDocument();
    expect(screen.getByText('Browse Files')).toBeInTheDocument();
  });

  it('shows storage usage progress bar', () => {
    const { container } = render(<AppStoragePane />);
    const progressBar = container.querySelector('.bg-primary');
    expect(progressBar).toBeInTheDocument();
  });

  it('displays file upload dates', () => {
    render(<AppStoragePane />);
    const dates = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
    expect(dates.length).toBeGreaterThan(0);
  });

  it('renders file type icons', () => {
    const { container } = render(<AppStoragePane />);
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('has accessible buttons', () => {
    render(<AppStoragePane />);
    expect(screen.getByLabelText('Upload file')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Download').length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText('Delete').length).toBeGreaterThan(0);
  });
});
