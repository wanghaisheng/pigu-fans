import type { AnyPublication } from '@hey/lens';
import type { FC } from 'react';

import { VerifiedOpenActionModules } from '@hey/data/verified-openaction-modules';
import getPublicationViewCountById from '@hey/lib/getPublicationViewCountById';
import isOpenActionAllowed from '@hey/lib/isOpenActionAllowed';
import { isMirrorPublication } from '@hey/lib/publicationHelpers';
import stopEventPropagation from '@hey/lib/stopEventPropagation';
import { memo } from 'react';
import { useImpressionsStore } from 'src/store/non-persisted/useImpressionsStore';
import { useFeatureFlagsStore } from 'src/store/persisted/useFeatureFlagsStore';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

import OpenAction from '../OpenAction';
import TipOpenAction from '../OpenAction/UnknownModule/Tip';
import Comment from './Comment';
import Like from './Like';
import Mod from './Mod';
import ShareMenu from './Share';
import Views from './Views';

interface PublicationActionsProps {
  publication: AnyPublication;
  showCount?: boolean;
}

const PublicationActions: FC<PublicationActionsProps> = ({
  publication,
  showCount = false
}) => {
  const targetPublication = isMirrorPublication(publication)
    ? publication.mirrorOn
    : publication;
  const { currentProfile } = useProfileStore();
  const { gardenerMode } = useFeatureFlagsStore();
  const { publicationViews } = useImpressionsStore();
  const hasOpenAction = (targetPublication.openActionModules?.length || 0) > 0;

  const canMirror = currentProfile
    ? targetPublication.operations.canMirror
    : true;
  const canAct =
    hasOpenAction && isOpenActionAllowed(targetPublication.openActionModules);
  const views = getPublicationViewCountById(
    publicationViews,
    targetPublication.id
  );

  // Check if the publication has a tip module
  const canTip = targetPublication.openActionModules.some(
    (module) => module.contract.address === VerifiedOpenActionModules.Tip
  );

  return (
    <span
      className="-ml-2 mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 sm:gap-8"
      onClick={stopEventPropagation}
    >
      <Comment publication={targetPublication} showCount={showCount} />
      {canMirror ? (
        <ShareMenu publication={publication} showCount={showCount} />
      ) : null}
      <Like publication={targetPublication} showCount={showCount} />
      {canAct ? (
        <OpenAction publication={publication} showCount={showCount} />
      ) : null}
      {canTip ? (
        <TipOpenAction
          isFullPublication={showCount}
          publication={publication}
        />
      ) : null}
      {views > 0 ? <Views showCount={showCount} views={views} /> : null}
      {gardenerMode ? (
        <Mod isFullPublication={showCount} publication={targetPublication} />
      ) : null}
    </span>
  );
};

export default memo(PublicationActions);
