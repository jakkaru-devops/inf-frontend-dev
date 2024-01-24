import { IAcatMark, IAcatModel } from './interfaces';

export const getAcatModelFullName = (mark: IAcatMark, model: IAcatModel) =>
  `${!model?.name?.includes(mark?.name) && mark?.name + ' '}${model?.name}`;
