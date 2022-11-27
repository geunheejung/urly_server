import cryptoJs from 'crypto-js';
import { IUser } from '../../../types/api';

export const getInsertUserQuery = (user: IUser) => {
  const {
    id,
    password,
    name,
    phone,
    address,
    detailAddress,
    gender,
    birth,
    additionalType,
    additionalValue,
    requiredTermsCondition,
    requiredTermsOfPrivacy,
    optionalTermsOfPrivacy,
    signupEventAll,
    optionalTermsOfSms,
    optionalTermsOfMailing,
    requiredSignupAge,
  } = user;

  const _password = cryptoJs.AES.encrypt(
    password,
    process.env.PRIVATE_KEY as string
  ).toString();

  const columns =
    'id, password, name, phone, address, detail_address, gender, birth, additional_type, additional_value, required_terms_condition, required_terms_of_privacy, optional_terms_of_privacy, signup_event_all, optional_terms_of_sms, optional_terms_of_mailing, required_signup_age';
  const values = `'${id}', '${_password}', '${name}',	'${phone}', '${address}', '${detailAddress}',	'${gender}', '${birth}', '${additionalType}',	'${additionalValue}', '${requiredTermsCondition}', '${requiredTermsOfPrivacy}',	'${optionalTermsOfPrivacy}', '${signupEventAll}', '${optionalTermsOfSms}', '${optionalTermsOfMailing}','${requiredSignupAge}'`;

  const query = `INSERT INTO User(${columns}) VALUES(${values})`.replace(
    /\t/g,
    ''
  );

  return query;
};
