import type { Dispatch, FC, SetStateAction } from 'react';

import { ClockIcon, FlagIcon } from '@heroicons/react/24/outline';
import { ModFeedType } from '@hey/data/enums';
import { TabButton } from '@hey/ui';

interface FeedTypeProps {
  feedType: ModFeedType;
  setFeedType: Dispatch<SetStateAction<ModFeedType>>;
}

const FeedType: FC<FeedTypeProps> = ({ feedType, setFeedType }) => {
  return (
    <div className="flex gap-3 overflow-x-auto sm:px-0">
      <TabButton
        active={feedType === ModFeedType.LATEST}
        icon={<ClockIcon className="size-4" />}
        name="Latest"
        onClick={() => {
          setFeedType(ModFeedType.LATEST);
        }}
      />
      <TabButton
        active={feedType === ModFeedType.REPORTS}
        icon={<FlagIcon className="size-4" />}
        name="Reports"
        onClick={() => {
          setFeedType(ModFeedType.REPORTS);
        }}
      />
    </div>
  );
};

export default FeedType;