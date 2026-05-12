'use client';

import { useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { useUserPrefs } from '@/stores/userPrefs';

function UserPrefsLoader({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { setCuisines, setIntolerances, setDietary, setFamilySize, setMealPeople } = useUserPrefs();

  useEffect(() => {
    if (!session?.user) return;
    fetch('/api/profile/prefs')
      .then((res) => res.ok && res.json())
      .then((data) => {
        if (data) {
          if (data.cuisines) setCuisines(data.cuisines);
          if (data.intolerances) setIntolerances(data.intolerances);
          if (data.dietary) setDietary(data.dietary);
          if (data.familySize) setFamilySize(data.familySize);
          if (data.mealPeople !== undefined) setMealPeople(data.mealPeople);
        }
      })
      .catch(() => {});
  }, [session]);

  return <>{children}</>;
}

export function Providers({ children, session }: { children: React.ReactNode; session?: any }) {
  return (
    <SessionProvider session={session}>
      <UserPrefsLoader>{children}</UserPrefsLoader>
    </SessionProvider>
  );
}
