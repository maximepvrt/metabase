import type { ReactElement } from "react";
import { useState, useCallback, createContext, useContext } from "react";
import { t } from "ttag";
import type { FormikValues } from "formik";
import { useFormikContext } from "formik";

import type { Collection, CollectionId } from "metabase-types/api";
import CreateCollectionModal from "metabase/collections/containers/CreateCollectionModal";
import { NewCollectionButton } from "./CreateCollectionOnTheGo.styled";

interface Values extends FormikValues {
  collection_id: CollectionId;
}

interface State {
  enabled?: boolean;
  resumedValues?: Values;
  openCollectionId?: CollectionId;
  showOnlyPersonalCollections?: boolean;
}

const Context = createContext<{
  canCreateNew?: boolean;
  updateState?: (newState: State) => void;
}>({});

export function CreateCollectionOnTheGo({
  children,
}: {
  children: (props: { resumedValues?: Values }) => ReactElement;
}) {
  const [state, setState] = useState<State>({});
  const updateState = useCallback(
    (newState: State) => setState({ ...state, ...newState }),
    [state, setState],
  );
  const {
    enabled,
    resumedValues,
    openCollectionId,
    showOnlyPersonalCollections,
  } = state;
  return enabled ? (
    <CreateCollectionModal
      collectionId={openCollectionId}
      onClose={() => updateState({ enabled: false })}
      onCreate={(collection: Collection) => {
        updateState({
          enabled: false,
          resumedValues: { ...resumedValues, collection_id: collection.id },
        });
      }}
      showOnlyPersonalCollections={showOnlyPersonalCollections}
    />
  ) : (
    <Context.Provider value={{ canCreateNew: true, updateState }}>
      {children({ resumedValues })}
    </Context.Provider>
  );
}

interface CreateCollectionOnTheGoButtonProps {
  openCollectionId?: CollectionId;
  showOnlyPersonalCollections?: boolean;
}

export function CreateCollectionOnTheGoButton({
  openCollectionId,
  showOnlyPersonalCollections,
}: CreateCollectionOnTheGoButtonProps) {
  const { canCreateNew, updateState } = useContext(Context);
  const formik = useFormikContext<Values>();
  return canCreateNew && formik ? (
    <NewCollectionButton
      light
      icon="add"
      onClick={() =>
        updateState?.({
          enabled: true,
          resumedValues: formik.values,
          openCollectionId,
          showOnlyPersonalCollections,
        })
      }
    >
      {t`New collection`}
    </NewCollectionButton>
  ) : null;
}
