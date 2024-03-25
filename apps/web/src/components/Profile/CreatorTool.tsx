import type { Profile } from '@hey/lens';
import type { FC } from 'react';

import ToggleWrapper from '@components/Staff/Users/Overview/Tool/ToggleWrapper';
import {
  HEY_API_URL,
  STAFF_PICK_FEATURE_ID,
  VERIFIED_FEATURE_ID
} from '@hey/data/constants';
import { FeatureFlag } from '@hey/data/feature-flags';
import { CREATORTOOLS } from '@hey/data/tracking';
import getPreferences from '@hey/lib/api/getPreferences';
import { Card, Toggle } from '@hey/ui';
import getAuthApiHeaders from '@lib/getAuthApiHeaders';
import { Leafwatch } from '@lib/leafwatch';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface CreatorToolProps {
  profile: Profile;
}

const CreatorTool: FC<CreatorToolProps> = ({ profile }) => {
  const [updating, setUpdating] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);

  const allowedFeatures = [
    { id: VERIFIED_FEATURE_ID, key: FeatureFlag.Verified },
    { id: STAFF_PICK_FEATURE_ID, key: FeatureFlag.StaffPick }
  ];

  const { data: preferences, isLoading } = useQuery({
    queryFn: () => getPreferences(profile.id, getAuthApiHeaders()),
    queryKey: ['fetchPreferences', profile.id || '']
  });

  useEffect(() => {
    if (preferences) {
      setFeatures(preferences.features || []);
    }
  }, [preferences]);

  const updateFeatureFlag = (feature: { id: string; key: string }) => {
    const { id, key } = feature;
    const enabled = !features.includes(key);

    setUpdating(true);
    toast.promise(
      axios.post(
        `${HEY_API_URL}/internal/features/assign`,
        { enabled, id, profile_id: profile.id },
        { headers: getAuthApiHeaders() }
      ),
      {
        error: () => {
          setUpdating(false);
          return 'Failed to update flag';
        },
        loading: 'Updating the flag...',
        success: () => {
          Leafwatch.track(CREATORTOOLS.ASSIGN_FEATURE_FLAG, {
            feature: key,
            profile_id: profile.id
          });
          setUpdating(false);
          setFeatures((prev) =>
            enabled ? [...prev, key] : prev.filter((f) => f !== key)
          );
          return 'Flag updated';
        }
      }
    );
  };

  return (
    <Card
      as="aside"
      className="mb-4 space-y-2.5 border-yellow-400 !bg-yellow-300/20 p-5 text-yellow-600"
      forceRounded
    >
      <div className="font-bold">Creator Tool</div>
      <div className="space-y-2 pt-2 font-bold">
        {allowedFeatures.map((feature) => (
          <ToggleWrapper key={feature.id} title={feature.key}>
            <Toggle
              disabled={updating || isLoading}
              on={features.includes(feature.key)}
              setOn={() => updateFeatureFlag(feature)}
            />
          </ToggleWrapper>
        ))}
      </div>
    </Card>
  );
};

export default CreatorTool;
