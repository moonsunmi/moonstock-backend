// JWT 토큰으로 Express 서버 인증 구현
// https://www.deviantceblog.com/it-75/

// 손선임 nest 코드
// import { pbkdf2Sync, randomBytes } from 'crypto';
// import jwt from 'jsonwebtoken';
// import type { JwtPayload } from 'jsonwebtoken';
// // Libs
// import { isNotNull } from './common';

// const SECRET_KEY =
//   'souldiarys-auth:)$xb4i&jw__aZFKW#Emuf^z1o*d+&O+m4Jxh9!1b=n*!K|R$';

// export const jwt_encode = (payload: any, token_type: string) => {
//   let exp = '';
//   if (token_type === 'access') {
//     exp = '12h';
//   } else if (token_type === 'refresh') {
//     exp = '1h';
//   } else {
//     throw new Error('Invalid Token type');
//   }

//   return jwt.sign(payload, SECRET_KEY, {
//     expiresIn: exp,
//   });
// };

// export const jwt_decode = (token: any) => {
//   return jwt.decode(token) as JwtPayload; // 만료가 되었어도 JWT 데이터 값 리턴
// };

// export const jwt_verify = (token: string) => {
//   return jwt.verify(token, SECRET_KEY) as JwtPayload; // 만료가 되었다면 에러를 발생
// };

// export const pbkdf2_sha512_encode = (raw_password: string, salt: string) => {
//   const algorithm = 'pbkdf2_sha512';
//   const iterations = 320000;

//   const _salt = isNotNull(salt) ? salt : randomBytes(64).toString('base64');
//   const hash = pbkdf2Sync(
//     raw_password,
//     _salt,
//     iterations,
//     64,
//     'sha512',
//   ).toString('base64');

//   return `${algorithm}$${iterations}$${_salt}$${hash}`;
// };

// export const pbkdf2_sha512_decode = (encoded_password: string) => {
//   const [algorithm, iterations, salt, hash] = encoded_password.split('$');
//   return {
//     algorithm: algorithm,
//     iterations: iterations,
//     salt: salt,
//     hash: hash,
//   };
// };

// export const pbkdf2_sha512_verify = (
//   raw_password: string,
//   encoded_password: string,
// ) => {
//   const decoded_password = pbkdf2_sha512_decode(encoded_password);
//   const new_encoded_password = pbkdf2_sha512_encode(
//     raw_password,
//     decoded_password['salt'],
//   );
//   return encoded_password === new_encoded_password;
// };

///대강의사용법
// import { Body, Inject, Injectable, Req, Res } from '@nestjs/common';
// import { Request, Response } from 'express';
// // Services
// import { PrismaService } from '@/prisma/prisma.service';
// // Types
// import { LoginDto } from './dtos/auth.dto';
// // Libs
// import {
//   jwt_decode,
//   jwt_encode,
//   jwt_verify,
//   pbkdf2_sha512_verify,
// } from '@/common/lib/auth';
// import { CacheManagerStore } from 'cache-manager'; //6버전에서는 안 된다고.
// import { CACHE_MANAGER } from '@nestjs/cache-manager';

// @Injectable()
// export class AuthService {
//   constructor(
//     private prisma: PrismaService,
//     @Inject(CACHE_MANAGER) private cacheManager: CacheManagerStore,
//   ) {}

//   async login(
//     @Req() request: Request,
//     @Res() response: Response,
//     @Body() body: LoginDto,
//   ) {
//     try {
//       if (
//         Object.keys(body).includes('username') &&
//         Object.keys(body).includes('password')
//       ) {
//         const result = await this.prisma.user.findFirstOrThrow({
//           include: {
//             groups: {
//               include: {
//                 group: true,
//               },
//             },
//           },
//           where: {
//             username: body['username'],
//           },
//         });

//         if (pbkdf2_sha512_verify(body['password'], result.password)) {
//           const payload = {
//             uid: result.uid,
//             name: result.name,
//             username: result.username,
//             groupList: result.groups.map((userOnGroup) => {
//               return {
//                 gid: userOnGroup.gid,
//                 name: userOnGroup.group.name,
//                 authority: userOnGroup.authority,
//               };
//             }),
//           };

//           const access_token = jwt_encode(payload, 'access');
//           const refresh_token = jwt_encode(payload, 'refresh');

//           return response
//             .cookie('refresh_token', refresh_token, {
//               httpOnly: true,
//               secure: true,
//               maxAge: 43200,
//             })
//             .status(200)
//             .send({ access_token: access_token });
//         } else {
//           return response
//             .status(401)
//             .send('[AUTH] 401 - Passwords do not match.');
//         }
//       } else {
//         return response
//           .status(404)
//           .send('[AUTH] 404 - Not found data for login.');
//       }
//     } catch (error) {
//       console.error(error);

//       return response.status(400).send('[AUTH] 400 - Fail to login.');
//     }
//   }

//   async logout(@Req() request: Request, @Res() response: Response) {
//     try {
//       // access token expired
//       const accessToken = request.headers.authorization;
//       if (accessToken) {
//         const payload = jwt_verify(accessToken.replace(/^Bearer\s+/, ''));

//         const remainTime = payload.exp - Date.now();
//         if (remainTime > 0) {
//           await this.cacheManager.set(accessToken, '', remainTime);
//         }
//       } else {
//         return response
//           .status(404)
//           .send('[AUTH] 404 - Not found data for logout.');
//       }
//       // refresh token expired
//       if (Object.keys(request.cookies).includes('refresh_token')) {
//         const payload = jwt_decode(request.cookies['refresh_token']);

//         const remainTime = payload.exp - Date.now();
//         if (remainTime > 0) {
//           await this.cacheManager.set(
//             request.cookies['refresh_token'],
//             '',
//             remainTime,
//           );
//         }
//         return response.status(204).clearCookie('refresh_token').send();
//       } else {
//         return response
//           .status(404)
//           .send('[AUTH] 404 - Not found data for logout.');
//       }
//     } catch (error) {
//       console.error(error);

//       return response.status(400).send('[AUTH] 400 - Fail to logout.');
//     }
//   }

//   async token_refresh(@Req() request: Request, @Res() response: Response) {
//     try {
//       if (Object.keys(request.cookies).includes('refresh_token')) {
//         const payload = jwt_verify(request.cookies['refresh_token']);
//         if (payload !== null) {
//           const result = await this.prisma.user.findFirstOrThrow({
//             include: {
//               groups: {
//                 include: {
//                   group: true,
//                 },
//               },
//             },
//             where: {
//               uid: payload.uid,
//             },
//           });

//           const new_payload = {
//             uid: result.uid,
//             name: result.name,
//             username: result.username,
//             groupList: result.groups.map((userOnGroup) => {
//               return {
//                 gid: userOnGroup.gid,
//                 name: userOnGroup.group.name,
//                 authority: userOnGroup.authority,
//               };
//             }),
//           };
//           const new_access_token = jwt_encode(new_payload, 'access');
//           return response.status(200).send({ access_token: new_access_token });
//         } else {
//           return response.status(401).send('[AUTH] 401 - Invalid Token.');
//         }
//       } else {
//         return response
//           .status(404)
//           .send('[AUTH] 404 - Not found data for refresh token.');
//       }
//     } catch (error) {
//       console.error(error);

//       return response.status(400).send('[AUTH] 400 - Fail to refresh token.');
//     }
//   }

//   async token_verify(@Req() request: Request, @Res() response: Response) {
//     try {
//       if (Object.keys(request.cookies).includes('refresh_token')) {
//         const payload = jwt_verify(request.cookies['refresh_token']);
//         if (payload !== null) {
//           return response.status(200).send(payload);
//         } else {
//           return response.status(401).send('[AUTH] 401 - Invalid Token.');
//         }
//       } else {
//         return response
//           .status(404)
//           .send('[AUTH] 404 - Not found data for verify token.');
//       }
//     } catch (error) {
//       console.error(error);

//       return response.status(400).send('[AUTH] 400 - Fail to verify token.');
//     }
//   }
// }
