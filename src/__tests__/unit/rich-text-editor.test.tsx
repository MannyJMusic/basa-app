/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { RichTextEditor } from '@/components/admin/rich-text-editor'

describe('RichTextEditor', () => {
  it('mounts, shows the given HTML as content, and exposes the source view', async () => {
    const onChange = jest.fn()
    render(<RichTextEditor value="<h1><strong>Tagline</strong></h1><p>Intro</p>" onChange={onChange} />)
    // useEditor renders on an effect (immediatelyRender: false), so wait for the content.
    await waitFor(() => expect(screen.getByText('Tagline')).toBeTruthy())
    expect(screen.getByText('Intro')).toBeTruthy()
    expect(onChange).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /source/i }))
    const source = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(source.value).toContain('<h1>')
    fireEvent.change(source, { target: { value: '<p>Changed</p>' } })
    expect(onChange).toHaveBeenCalledWith('<p>Changed</p>')
  })

  it('takes an outside replacement of the value, as the flyer tool does', async () => {
    const { rerender } = render(<RichTextEditor value="" onChange={() => {}} />)
    await waitFor(() => expect(document.querySelector('.rich-text-editor')).toBeTruthy())
    rerender(<RichTextEditor value="<h2>Event Details</h2><ul><li>Date</li></ul>" onChange={() => {}} />)
    await waitFor(() => expect(screen.getByText('Event Details')).toBeTruthy())
    expect(screen.getByText('Date')).toBeTruthy()
  })
})
