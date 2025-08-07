-- Link the user profile to the test organization
UPDATE public.profiles 
SET organization_id = 'da3f8c89-424c-4c6a-90e3-9af3d4207f19'
WHERE user_id = '6d7b0185-99d1-40d5-b51a-91bbca2560c2';