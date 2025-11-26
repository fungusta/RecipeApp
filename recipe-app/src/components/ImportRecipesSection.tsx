import CircularButton from './CircularButton';

interface ImportRecipesSectionProps {
  onImportClick: () => void;
}

export default function ImportRecipesSection({ onImportClick }: ImportRecipesSectionProps) {
  return (
    <div className='flex flex-col items-center gap-3'>
      <span className="text-sm font-medium text-gray-500">or</span>
      <div className="flex flex-col items-center gap-2">
        <CircularButton
          onClick={onImportClick}
          variant="primary"
          size="md"
          title="Import recipe from URL"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </CircularButton>
        <span className="text-sm font-medium text-gray-600">Import Recipe</span>
      </div>
    </div>
  );
}

