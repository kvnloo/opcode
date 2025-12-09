import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultiplayerPane } from '@/components/mobile/workspace/panes/MultiplayerPane';

describe('MultiplayerPane', () => {
  it('renders multiplayer header', () => {
    render(<MultiplayerPane />);
    expect(screen.getByText('Multiplayer')).toBeInTheDocument();
  });

  it('displays online participant count', () => {
    render(<MultiplayerPane />);
    expect(screen.getByText(/online/)).toBeInTheDocument();
  });

  it('displays tab navigation', () => {
    render(<MultiplayerPane />);
    expect(screen.getByText('Participants')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Voice')).toBeInTheDocument();
  });

  it('defaults to participants tab', () => {
    render(<MultiplayerPane />);
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows participant status', () => {
    render(<MultiplayerPane />);
    expect(screen.getAllByText('active').length).toBeGreaterThan(0);
    expect(screen.getByText('idle')).toBeInTheDocument();
  });

  it('can switch to chat tab', () => {
    render(<MultiplayerPane />);
    const chatTab = screen.getByText('Chat');
    fireEvent.click(chatTab);
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
  });

  it('displays chat messages', () => {
    render(<MultiplayerPane />);
    const chatTab = screen.getByText('Chat');
    fireEvent.click(chatTab);
    expect(screen.getByText('Hey! Working on the auth system')).toBeInTheDocument();
    expect(screen.getByText('Cool, I am fixing the UI bugs')).toBeInTheDocument();
  });

  it('can send chat messages', () => {
    render(<MultiplayerPane />);
    const chatTab = screen.getByText('Chat');
    fireEvent.click(chatTab);

    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('clears input after sending message', () => {
    render(<MultiplayerPane />);
    const chatTab = screen.getByText('Chat');
    fireEvent.click(chatTab);

    const input = screen.getByPlaceholderText('Type a message...') as HTMLInputElement;
    const sendButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(sendButton);

    expect(input.value).toBe('');
  });

  it('can send message with Enter key', () => {
    render(<MultiplayerPane />);
    const chatTab = screen.getByText('Chat');
    fireEvent.click(chatTab);

    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Enter test' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(screen.getByText('Enter test')).toBeInTheDocument();
  });

  it('can switch to voice tab', () => {
    render(<MultiplayerPane />);
    const voiceTab = screen.getByText('Voice');
    fireEvent.click(voiceTab);
    expect(screen.getByText('Voice & Video Chat')).toBeInTheDocument();
  });

  it('has mic and video controls in voice tab', () => {
    render(<MultiplayerPane />);
    const voiceTab = screen.getByText('Voice');
    fireEvent.click(voiceTab);
    expect(screen.getByLabelText('Unmute')).toBeInTheDocument();
    expect(screen.getByLabelText('Start video')).toBeInTheDocument();
  });

  it('can toggle microphone', () => {
    render(<MultiplayerPane />);
    const voiceTab = screen.getByText('Voice');
    fireEvent.click(voiceTab);

    const micButton = screen.getByLabelText('Unmute');
    fireEvent.click(micButton);
    expect(screen.getByLabelText('Mute')).toBeInTheDocument();
  });

  it('can toggle video', () => {
    render(<MultiplayerPane />);
    const voiceTab = screen.getByText('Voice');
    fireEvent.click(voiceTab);

    const videoButton = screen.getByLabelText('Start video');
    fireEvent.click(videoButton);
    expect(screen.getByLabelText('Stop video')).toBeInTheDocument();
  });

  it('has invite button', () => {
    render(<MultiplayerPane />);
    expect(screen.getByLabelText('Invite')).toBeInTheDocument();
  });

  it('displays participant avatars with colors', () => {
    const { container } = render(<MultiplayerPane />);
    const avatars = container.querySelectorAll('.rounded-full');
    expect(avatars.length).toBeGreaterThan(0);
  });

  it('shows message timestamps', () => {
    render(<MultiplayerPane />);
    const chatTab = screen.getByText('Chat');
    fireEvent.click(chatTab);
    const timestamps = screen.getAllByText(/\d{1,2}:\d{2}/);
    expect(timestamps.length).toBeGreaterThan(0);
  });
});
