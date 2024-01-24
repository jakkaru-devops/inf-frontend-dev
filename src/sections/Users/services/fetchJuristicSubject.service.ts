import { API_ENDPOINTS } from 'data/paths.data';
import { IJuristicSubject } from 'sections/JuristicSubject/interfaces';
import { APIRequest } from 'utils/api.utils';

export const fetchJuristicSubjectService = async (
  id: IJuristicSubject['id'],
) => {
  const res = await APIRequest({
    method: 'get',
    url: API_ENDPOINTS.USER_JURISTIC_SUBJECT,
    params: {
      id,
    },
    requireAuth: true,
  });

  return res?.data as IJuristicSubject;
};
