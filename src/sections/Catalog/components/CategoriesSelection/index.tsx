import { Fragment, FC } from 'react';
import CategoriesSelectionAutoTypes from './AutoTypes';
import CategoriesSelectionAutoBrands from './AutoBrands';
import CategoriesSelectionGroups from './Groups';
import { Preloader } from 'components/common';
import { ICategoriesSelectionProps } from './interfaces';
import { useHandlers } from './handlers';

const CategoriesSelection: FC<ICategoriesSelectionProps> = props => {
  const {
    dataLoaded,
    selectedAutoTypeId,
    selectedAutoBrands,
    setSelectedAutoBrands,
    selectedGroupIds,
    setSelectedGroupIds,
    autoTypes,
    groups,
    autoBrands,
    handleAutoTypeClick,
    handleAutoBrandClick,
    handleGroupClick,
  } = useHandlers(props);
  const { generateAutoTypeHref, generateAutoBrandHref, generateGroupHref } =
    props;

  return (
    <div className="categories-selection">
      {dataLoaded ? (
        <Fragment>
          <CategoriesSelectionAutoTypes
            autoTypes={autoTypes}
            selectedAutoTypeId={selectedAutoTypeId}
            onAutoTypeClick={handleAutoTypeClick}
            generateHref={generateAutoTypeHref}
          />
          <CategoriesSelectionAutoBrands
            autoBrands={autoBrands}
            selectedAutoTypeId={selectedAutoTypeId}
            selectedAutoBrands={selectedAutoBrands}
            onAutoBrandClick={handleAutoBrandClick}
            loading={false}
            generateHref={generateAutoBrandHref}
            showCheckboxes={!!setSelectedAutoBrands}
          />
          <br />
          <br />
          {!!groups?.length && (
            <CategoriesSelectionGroups
              groups={groups}
              selectedGroupIds={selectedGroupIds}
              onGroupClick={handleGroupClick}
              generateHref={generateGroupHref}
              showCheckboxes={!!setSelectedGroupIds}
            />
          )}
        </Fragment>
      ) : (
        <Preloader />
      )}
    </div>
  );
};

export default CategoriesSelection;
