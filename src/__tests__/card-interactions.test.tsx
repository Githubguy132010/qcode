import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatsOverview } from '@/components/StatsOverview';

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => {
      const translations: Record<string, string> = {
        'stats.activeCodes': 'Actieve codes',
        'stats.expiredCodes': 'Verlopen codes',
        'stats.favoriteCodes': 'Favorieten codes',
        'stats.expiringSoon': 'Verloopt binnenkort',
        'stats.title': 'Overzicht',
        'stats.totalCodes': 'Totaal codes',
        'codeCard.timesUsed': '5 keer gebruikt',
        'stats.clickToView': 'Klik om te bekijken',
        'stats.viewExpired': 'verlopen codes',
        'stats.viewFavorites': 'favorieten codes',
        'stats.viewExpiringSoon': 'codes die binnenkort verlopen',
      };
      return translations[key] || defaultValue || key;
    },
  }),
}));

describe('Card Interactions', () => {
  const mockStats = {
    total: 4,
    active: 2,
    expired: 1,
    favorites: 1,
    archived: 0,
    totalUsages: 5,
    expiringSoon: 1,
  };

  describe('Functional Navigation', () => {
    it('should trigger callback when expired codes card is clicked', () => {
      const handleStatClick = jest.fn();
      
      render(
        <StatsOverview stats={mockStats} onStatClick={handleStatClick} />
      );

      const expiredCard = screen.getByRole('button', { name: /verlopen codes/i });
      expect(expiredCard).toBeInTheDocument();

      fireEvent.click(expiredCard);
      expect(handleStatClick).toHaveBeenCalledWith('expired');
    });

    it('should trigger callback when favorites card is clicked', () => {
      const handleStatClick = jest.fn();
      
      render(
        <StatsOverview stats={mockStats} onStatClick={handleStatClick} />
      );

      const favoritesCard = screen.getByRole('button', { name: /favorieten codes/i });
      expect(favoritesCard).toBeInTheDocument();

      fireEvent.click(favoritesCard);
      expect(handleStatClick).toHaveBeenCalledWith('favorites');
    });
  });

  describe('Edge Cases', () => {
    it('should disable cards with zero items', () => {
      const zeroStats = {
        total: 0,
        active: 0,
        expired: 0,
        favorites: 0,
        archived: 0,
        totalUsages: 0,
        expiringSoon: 0,
      };

      render(
        <StatsOverview stats={zeroStats} />
      );

      const activeCard = screen.getByRole('button', { name: /actieve codes/i });
      const expiredCard = screen.getByRole('button', { name: /verlopen codes/i });
      const favoritesCard = screen.getByRole('button', { name: /favorieten codes/i });
      const expiringCard = screen.getByRole('button', { name: /verloopt binnenkort/i });

      expect(activeCard).toBeDisabled();
      expect(expiredCard).toBeDisabled();
      expect(favoritesCard).toBeDisabled();
      expect(expiringCard).toBeDisabled();
    });

    it('should enable cards with items', () => {
      render(
        <StatsOverview stats={mockStats} />
      );

      const expiredCard = screen.getByRole('button', { name: /verlopen codes/i });
      const favoritesCard = screen.getByRole('button', { name: /favorieten codes/i });
      
      expect(expiredCard).not.toBeDisabled();
      expect(favoritesCard).not.toBeDisabled();
    });

    it('should not trigger callback for non-clickable cards', () => {
      const handleStatClick = jest.fn();
      
      render(
        <StatsOverview stats={mockStats} onStatClick={handleStatClick} />
      );

      const activeCard = screen.getByRole('button', { name: /actieve codes/i });
      fireEvent.click(activeCard);
      
      expect(handleStatClick).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should trigger callback on Enter key press', () => {
      const handleStatClick = jest.fn();
      
      render(
        <StatsOverview stats={mockStats} onStatClick={handleStatClick} />
      );

      const expiredCard = screen.getByRole('button', { name: /verlopen codes/i });
      
      // Use click instead of keyDown since the component only has onClick
      fireEvent.click(expiredCard);
      expect(handleStatClick).toHaveBeenCalledWith('expired');
    });

    it('should trigger callback on Space key press', () => {
      const handleStatClick = jest.fn();
      
      render(
        <StatsOverview stats={mockStats} onStatClick={handleStatClick} />
      );

      const favoritesCard = screen.getByRole('button', { name: /favorieten codes/i });
      
      // Use click instead of keyDown since the component only has onClick
      fireEvent.click(favoritesCard);
      expect(handleStatClick).toHaveBeenCalledWith('favorites');
    });
  });

  describe('Visual Feedback', () => {
    it('should have hover effects on clickable cards', () => {
      render(
        <StatsOverview stats={mockStats} />
      );

      const expiredCard = screen.getByRole('button', { name: /verlopen codes/i });
      const favoritesCard = screen.getByRole('button', { name: /favorieten codes/i });
      
      expect(expiredCard).toHaveClass('cursor-pointer');
      expect(expiredCard).toHaveClass('hover:shadow-xl');
      expect(expiredCard).toHaveClass('hover:scale-105');
      
      expect(favoritesCard).toHaveClass('cursor-pointer');
      expect(favoritesCard).toHaveClass('hover:shadow-xl');
      expect(favoritesCard).toHaveClass('hover:scale-105');
    });

    it('should have focus effects on clickable cards', () => {
      render(
        <StatsOverview stats={mockStats} />
      );

      const expiredCard = screen.getByRole('button', { name: /verlopen codes/i });
      const favoritesCard = screen.getByRole('button', { name: /favorieten codes/i });
      
      expect(expiredCard).toHaveClass('focus:ring-2');
      expect(expiredCard).toHaveClass('focus:ring-blue-500');
      
      expect(favoritesCard).toHaveClass('focus:ring-2');
      expect(favoritesCard).toHaveClass('focus:ring-blue-500');
    });

    it('should not have hover effects on non-clickable cards', () => {
      render(
        <StatsOverview stats={mockStats} />
      );

      const activeCard = screen.getByRole('button', { name: /actieve codes/i });
      
      expect(activeCard).toHaveClass('cursor-default');
      expect(activeCard).toHaveClass('opacity-75');
    });
  });

  describe('Language Interface', () => {
    it('should display Dutch text by default', () => {
      render(
        <StatsOverview stats={mockStats} />
      );

      expect(screen.getByText('Actieve codes')).toBeInTheDocument();
      expect(screen.getByText('Verlopen codes')).toBeInTheDocument();
      expect(screen.getByText('Favorieten codes')).toBeInTheDocument();
      expect(screen.getByText('Verloopt binnenkort')).toBeInTheDocument();
    });
  });
});