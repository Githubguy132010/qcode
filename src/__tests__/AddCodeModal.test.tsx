import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddCodeModal } from '../components/AddCodeModal';

describe('AddCodeModal', () => {
  const setup = (overrides?: Partial<React.ComponentProps<typeof AddCodeModal>>) => {
    const onClose = jest.fn();
    const onAdd = jest.fn();
    const props: React.ComponentProps<typeof AddCodeModal> = {
      isOpen: true,
      onClose,
      onAdd,
      ...overrides,
    };
    const utils = render(<AddCodeModal {...props} />);
    return { onClose, onAdd, ...utils };
  };

  it('renders null when closed', () => {
    const { container } = render(
      <AddCodeModal isOpen={false} onClose={() => {}} onAdd={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows validation errors when submitting empty form', () => {
    setup();

    // Submit immediately
    const saveBtn = screen.getByText('addCode.saveButton');
    fireEvent.click(saveBtn);

    // Since our i18n mock returns keys when translations are missing,
    // we assert error keys appear
    expect(screen.getByText('validation.codeRequired')).toBeInTheDocument();
    expect(screen.getByText('validation.storeRequired')).toBeInTheDocument();
    expect(screen.getByText('validation.discountRequired')).toBeInTheDocument();
  });

  it('validates that expiry date cannot be in the past', () => {
    const { onAdd } = setup();

    // Fill required fields
    fireEvent.change(screen.getByLabelText('addCode.codeLabel'), { target: { value: 'ABC123' } });
    fireEvent.change(screen.getByLabelText('addCode.storeLabel'), { target: { value: 'TestStore' } });
    fireEvent.change(screen.getByLabelText('addCode.discountLabel'), { target: { value: '20%' } });

    // Set past date (yesterday)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const y = yesterday.toISOString().split('T')[0];
    fireEvent.change(screen.getByLabelText('addCode.expiryDateLabel'), { target: { value: y } });

    const saveBtn = screen.getByText('addCode.saveButton');
    fireEvent.click(saveBtn);

    // Ensure the submit handler is not called for past dates
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('submits valid form and resets fields, calling onAdd and onClose', () => {
    const { onAdd, onClose } = setup();

    // Fill required fields
    const codeInput = screen.getByLabelText('addCode.codeLabel') as HTMLInputElement;
    const storeInput = screen.getByLabelText('addCode.storeLabel') as HTMLInputElement;
    const discountInput = screen.getByLabelText('addCode.discountLabel') as HTMLInputElement;

    fireEvent.change(codeInput, { target: { value: 'SPRING20' } });
    fireEvent.change(storeInput, { target: { value: 'Acme' } });
    fireEvent.change(discountInput, { target: { value: '20%' } });

    // Optional fields
    const priceInput = screen.getByLabelText('addCode.originalPriceLabel') as HTMLInputElement;
    fireEvent.change(priceInput, { target: { value: '50.00' } });

    const descInput = screen.getByLabelText('addCode.descriptionLabel') as HTMLTextAreaElement;
    fireEvent.change(descInput, { target: { value: 'Seasonal discount' } });

    const saveBtn = screen.getByText('addCode.saveButton');
    fireEvent.click(saveBtn);

    expect(onAdd).toHaveBeenCalledTimes(1);
    const submitted = (onAdd as jest.Mock).mock.calls[0][0];

    // Validate submitted shape (category default comes from component; we assert known fields)
    expect(submitted.code).toBe('SPRING20');
    expect(submitted.store).toBe('Acme');
    expect(submitted.discount).toBe('20%');
    expect(submitted.originalPrice).toBe('50.00');
    expect(submitted.description).toBe('Seasonal discount');

    // onClose should be called after successful submit
    expect(onClose).toHaveBeenCalledTimes(1);

    // Form should be reset (fields cleared)
    expect(codeInput.value).toBe('');
    expect(storeInput.value).toBe('');
    expect(discountInput.value).toBe('');
    expect(priceInput.value).toBe('');
    expect(descInput.value).toBe('');
  });
});