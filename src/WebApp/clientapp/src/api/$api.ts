import type { AspidaClient, BasicHeaders } from 'aspida';
import type { Methods as Methods_ac6duo } from './api/Auth/change-password';
import type { Methods as Methods_a4ur46 } from './api/Auth/entra-login';
import type { Methods as Methods_270u1f } from './api/Auth/login';
import type { Methods as Methods_1y0sj28 } from './api/Auth/logout';
import type { Methods as Methods_1pgikh8 } from './api/Auth/me';
import type { Methods as Methods_3j7cwd } from './api/Auth/reset-password';
import type { Methods as Methods_aahikm } from './api/Auth/reset-password-by-credentials';
import type { Methods as Methods_qu6uem } from './api/Auth/test-login';
import type { Methods as Methods_1le4j6n } from './api/Auth/test-users';
import type { Methods as Methods_xzne74 } from './api/User';
import type { Methods as Methods_10ziil1 } from './api/User/_userId@string';
import type { Methods as Methods_ne7oxy } from './api/call-center/bootstrap';
import type { Methods as Methods_1to4cnl } from './api/call-center/current-call/actions/_action@string';
import type { Methods as Methods_1p01euh } from './api/call-center/current-call/ai-response';
import type { Methods as Methods_1fxfynv } from './api/call-center/current-call/transcript';
import type { Methods as Methods_1049dgh } from './api/call-center/faqs/_faqId@string';
import type { Methods as Methods_1u1kumh } from './api/call-center/system-settings';
import type { Methods as Methods_mqepqw } from './api/call-center/test-calls';
import type { Methods as Methods_b9arif } from './api/call-center/transfer-destinations/_destinationId@string';

const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '');
  const PATH0 = '/api/Auth/change-password';
  const PATH1 = '/api/Auth/entra-login';
  const PATH2 = '/api/Auth/login';
  const PATH3 = '/api/Auth/logout';
  const PATH4 = '/api/Auth/me';
  const PATH5 = '/api/Auth/reset-password';
  const PATH6 = '/api/Auth/reset-password-by-credentials';
  const PATH7 = '/api/Auth/test-login';
  const PATH8 = '/api/Auth/test-users';
  const PATH9 = '/api/User';
  const PATH10 = '/api/call-center/bootstrap';
  const PATH11 = '/api/call-center/current-call/actions';
  const PATH12 = '/api/call-center/current-call/ai-response';
  const PATH13 = '/api/call-center/current-call/transcript';
  const PATH14 = '/api/call-center/faqs';
  const PATH15 = '/api/call-center/system-settings';
  const PATH16 = '/api/call-center/test-calls';
  const PATH17 = '/api/call-center/transfer-destinations';
  const GET = 'GET';
  const POST = 'POST';
  const PUT = 'PUT';
  const DELETE = 'DELETE';

  return {
    api: {
      Auth: {
        change_password: {
          /**
           * @returns OK
           */
          post: (option: { body: Methods_ac6duo['post']['reqBody'], config?: T | undefined }) =>
            fetch<Methods_ac6duo['post']['resBody'], BasicHeaders, Methods_ac6duo['post']['status']>(prefix, PATH0, POST, option).json(),
          /**
           * @returns OK
           */
          $post: (option: { body: Methods_ac6duo['post']['reqBody'], config?: T | undefined }) =>
            fetch<Methods_ac6duo['post']['resBody'], BasicHeaders, Methods_ac6duo['post']['status']>(prefix, PATH0, POST, option).json().then(r => r.body),
          $path: () => `${prefix}${PATH0}`,
        },
        entra_login: {
          /**
           * @returns OK
           */
          post: (option: { body: Methods_a4ur46['post']['reqBody'], config?: T | undefined }) =>
            fetch<Methods_a4ur46['post']['resBody'], BasicHeaders, Methods_a4ur46['post']['status']>(prefix, PATH1, POST, option).json(),
          /**
           * @returns OK
           */
          $post: (option: { body: Methods_a4ur46['post']['reqBody'], config?: T | undefined }) =>
            fetch<Methods_a4ur46['post']['resBody'], BasicHeaders, Methods_a4ur46['post']['status']>(prefix, PATH1, POST, option).json().then(r => r.body),
          $path: () => `${prefix}${PATH1}`,
        },
        login: {
          /**
           * @returns OK
           */
          post: (option: { body: Methods_270u1f['post']['reqBody'], config?: T | undefined }) =>
            fetch<Methods_270u1f['post']['resBody'], BasicHeaders, Methods_270u1f['post']['status']>(prefix, PATH2, POST, option).json(),
          /**
           * @returns OK
           */
          $post: (option: { body: Methods_270u1f['post']['reqBody'], config?: T | undefined }) =>
            fetch<Methods_270u1f['post']['resBody'], BasicHeaders, Methods_270u1f['post']['status']>(prefix, PATH2, POST, option).json().then(r => r.body),
          $path: () => `${prefix}${PATH2}`,
        },
        logout: {
          /**
           * @returns OK
           */
          post: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_1y0sj28['post']['resBody'], BasicHeaders, Methods_1y0sj28['post']['status']>(prefix, PATH3, POST, option).json(),
          /**
           * @returns OK
           */
          $post: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_1y0sj28['post']['resBody'], BasicHeaders, Methods_1y0sj28['post']['status']>(prefix, PATH3, POST, option).json().then(r => r.body),
          $path: () => `${prefix}${PATH3}`,
        },
        me: {
          /**
           * @returns OK
           */
          get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_1pgikh8['get']['resBody'], BasicHeaders, Methods_1pgikh8['get']['status']>(prefix, PATH4, GET, option).json(),
          /**
           * @returns OK
           */
          $get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_1pgikh8['get']['resBody'], BasicHeaders, Methods_1pgikh8['get']['status']>(prefix, PATH4, GET, option).json().then(r => r.body),
          $path: () => `${prefix}${PATH4}`,
        },
        reset_password: {
          /**
           * @returns OK
           */
          post: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_3j7cwd['post']['resBody'], BasicHeaders, Methods_3j7cwd['post']['status']>(prefix, PATH5, POST, option).json(),
          /**
           * @returns OK
           */
          $post: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_3j7cwd['post']['resBody'], BasicHeaders, Methods_3j7cwd['post']['status']>(prefix, PATH5, POST, option).json().then(r => r.body),
          $path: () => `${prefix}${PATH5}`,
        },
        reset_password_by_credentials: {
          /**
           * @returns OK
           */
          post: (option: { body: Methods_aahikm['post']['reqBody'], config?: T | undefined }) =>
            fetch<Methods_aahikm['post']['resBody'], BasicHeaders, Methods_aahikm['post']['status']>(prefix, PATH6, POST, option).json(),
          /**
           * @returns OK
           */
          $post: (option: { body: Methods_aahikm['post']['reqBody'], config?: T | undefined }) =>
            fetch<Methods_aahikm['post']['resBody'], BasicHeaders, Methods_aahikm['post']['status']>(prefix, PATH6, POST, option).json().then(r => r.body),
          $path: () => `${prefix}${PATH6}`,
        },
        test_login: {
          /**
           * @returns OK
           */
          post: (option: { body: Methods_qu6uem['post']['reqBody'], config?: T | undefined }) =>
            fetch<Methods_qu6uem['post']['resBody'], BasicHeaders, Methods_qu6uem['post']['status']>(prefix, PATH7, POST, option).json(),
          /**
           * @returns OK
           */
          $post: (option: { body: Methods_qu6uem['post']['reqBody'], config?: T | undefined }) =>
            fetch<Methods_qu6uem['post']['resBody'], BasicHeaders, Methods_qu6uem['post']['status']>(prefix, PATH7, POST, option).json().then(r => r.body),
          $path: () => `${prefix}${PATH7}`,
        },
        test_users: {
          /**
           * @returns OK
           */
          get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_1le4j6n['get']['resBody'], BasicHeaders, Methods_1le4j6n['get']['status']>(prefix, PATH8, GET, option).json(),
          /**
           * @returns OK
           */
          $get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_1le4j6n['get']['resBody'], BasicHeaders, Methods_1le4j6n['get']['status']>(prefix, PATH8, GET, option).json().then(r => r.body),
          $path: () => `${prefix}${PATH8}`,
        },
      },
      User: {
        _userId: (val2: string) => {
          const prefix2 = `${PATH9}/${val2}`;

          return {
            /**
             * @returns OK
             */
            get: (option?: { config?: T | undefined } | undefined) =>
              fetch<Methods_10ziil1['get']['resBody'], BasicHeaders, Methods_10ziil1['get']['status']>(prefix, prefix2, GET, option).json(),
            /**
             * @returns OK
             */
            $get: (option?: { config?: T | undefined } | undefined) =>
              fetch<Methods_10ziil1['get']['resBody'], BasicHeaders, Methods_10ziil1['get']['status']>(prefix, prefix2, GET, option).json().then(r => r.body),
            /**
             * @returns OK
             */
            put: (option: { body: Methods_10ziil1['put']['reqBody'], config?: T | undefined }) =>
              fetch<Methods_10ziil1['put']['resBody'], BasicHeaders, Methods_10ziil1['put']['status']>(prefix, prefix2, PUT, option).json(),
            /**
             * @returns OK
             */
            $put: (option: { body: Methods_10ziil1['put']['reqBody'], config?: T | undefined }) =>
              fetch<Methods_10ziil1['put']['resBody'], BasicHeaders, Methods_10ziil1['put']['status']>(prefix, prefix2, PUT, option).json().then(r => r.body),
            /**
             * @returns OK
             */
            delete: (option?: { config?: T | undefined } | undefined) =>
              fetch<Methods_10ziil1['delete']['resBody'], BasicHeaders, Methods_10ziil1['delete']['status']>(prefix, prefix2, DELETE, option).json(),
            /**
             * @returns OK
             */
            $delete: (option?: { config?: T | undefined } | undefined) =>
              fetch<Methods_10ziil1['delete']['resBody'], BasicHeaders, Methods_10ziil1['delete']['status']>(prefix, prefix2, DELETE, option).json().then(r => r.body),
            $path: () => `${prefix}${prefix2}`,
          };
        },
        /**
         * @returns OK
         */
        get: (option?: { config?: T | undefined } | undefined) =>
          fetch<Methods_xzne74['get']['resBody'], BasicHeaders, Methods_xzne74['get']['status']>(prefix, PATH9, GET, option).json(),
        /**
         * @returns OK
         */
        $get: (option?: { config?: T | undefined } | undefined) =>
          fetch<Methods_xzne74['get']['resBody'], BasicHeaders, Methods_xzne74['get']['status']>(prefix, PATH9, GET, option).json().then(r => r.body),
        /**
         * @returns OK
         */
        post: (option: { body: Methods_xzne74['post']['reqBody'], config?: T | undefined }) =>
          fetch<Methods_xzne74['post']['resBody'], BasicHeaders, Methods_xzne74['post']['status']>(prefix, PATH9, POST, option).json(),
        /**
         * @returns OK
         */
        $post: (option: { body: Methods_xzne74['post']['reqBody'], config?: T | undefined }) =>
          fetch<Methods_xzne74['post']['resBody'], BasicHeaders, Methods_xzne74['post']['status']>(prefix, PATH9, POST, option).json().then(r => r.body),
        $path: () => `${prefix}${PATH9}`,
      },
      call_center: {
        bootstrap: {
          /**
           * @returns OK
           */
          get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_ne7oxy['get']['resBody'], BasicHeaders, Methods_ne7oxy['get']['status']>(prefix, PATH10, GET, option).json(),
          /**
           * @returns OK
           */
          $get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_ne7oxy['get']['resBody'], BasicHeaders, Methods_ne7oxy['get']['status']>(prefix, PATH10, GET, option).json().then(r => r.body),
          $path: () => `${prefix}${PATH10}`,
        },
        current_call: {
          actions: {
            _action: (val4: string) => {
              const prefix4 = `${PATH11}/${val4}`;

              return {
                /**
                 * @returns OK
                 */
                put: (option?: { config?: T | undefined } | undefined) =>
                  fetch<Methods_1to4cnl['put']['resBody'], BasicHeaders, Methods_1to4cnl['put']['status']>(prefix, prefix4, PUT, option).json(),
                /**
                 * @returns OK
                 */
                $put: (option?: { config?: T | undefined } | undefined) =>
                  fetch<Methods_1to4cnl['put']['resBody'], BasicHeaders, Methods_1to4cnl['put']['status']>(prefix, prefix4, PUT, option).json().then(r => r.body),
                $path: () => `${prefix}${prefix4}`,
              };
            },
          },
          ai_response: {
            /**
             * @returns OK
             */
            post: (option?: { config?: T | undefined } | undefined) =>
              fetch<Methods_1p01euh['post']['resBody'], BasicHeaders, Methods_1p01euh['post']['status']>(prefix, PATH12, POST, option).json(),
            /**
             * @returns OK
             */
            $post: (option?: { config?: T | undefined } | undefined) =>
              fetch<Methods_1p01euh['post']['resBody'], BasicHeaders, Methods_1p01euh['post']['status']>(prefix, PATH12, POST, option).json().then(r => r.body),
            $path: () => `${prefix}${PATH12}`,
          },
          transcript: {
            /**
             * @returns OK
             */
            post: (option: { body: Methods_1fxfynv['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods_1fxfynv['post']['resBody'], BasicHeaders, Methods_1fxfynv['post']['status']>(prefix, PATH13, POST, option).json(),
            /**
             * @returns OK
             */
            $post: (option: { body: Methods_1fxfynv['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods_1fxfynv['post']['resBody'], BasicHeaders, Methods_1fxfynv['post']['status']>(prefix, PATH13, POST, option).json().then(r => r.body),
            $path: () => `${prefix}${PATH13}`,
          },
        },
        faqs: {
          _faqId: (val3: string) => {
            const prefix3 = `${PATH14}/${val3}`;

            return {
              /**
               * @returns OK
               */
              put: (option: { body: Methods_1049dgh['put']['reqBody'], config?: T | undefined }) =>
                fetch<Methods_1049dgh['put']['resBody'], BasicHeaders, Methods_1049dgh['put']['status']>(prefix, prefix3, PUT, option).json(),
              /**
               * @returns OK
               */
              $put: (option: { body: Methods_1049dgh['put']['reqBody'], config?: T | undefined }) =>
                fetch<Methods_1049dgh['put']['resBody'], BasicHeaders, Methods_1049dgh['put']['status']>(prefix, prefix3, PUT, option).json().then(r => r.body),
              $path: () => `${prefix}${prefix3}`,
            };
          },
        },
        system_settings: {
          /**
           * @returns OK
           */
          put: (option: { body: Methods_1u1kumh['put']['reqBody'], config?: T | undefined }) =>
            fetch<Methods_1u1kumh['put']['resBody'], BasicHeaders, Methods_1u1kumh['put']['status']>(prefix, PATH15, PUT, option).json(),
          /**
           * @returns OK
           */
          $put: (option: { body: Methods_1u1kumh['put']['reqBody'], config?: T | undefined }) =>
            fetch<Methods_1u1kumh['put']['resBody'], BasicHeaders, Methods_1u1kumh['put']['status']>(prefix, PATH15, PUT, option).json().then(r => r.body),
          $path: () => `${prefix}${PATH15}`,
        },
        test_calls: {
          /**
           * @returns OK
           */
          post: (option: { body: Methods_mqepqw['post']['reqBody'], config?: T | undefined }) =>
            fetch<Methods_mqepqw['post']['resBody'], BasicHeaders, Methods_mqepqw['post']['status']>(prefix, PATH16, POST, option).json(),
          /**
           * @returns OK
           */
          $post: (option: { body: Methods_mqepqw['post']['reqBody'], config?: T | undefined }) =>
            fetch<Methods_mqepqw['post']['resBody'], BasicHeaders, Methods_mqepqw['post']['status']>(prefix, PATH16, POST, option).json().then(r => r.body),
          $path: () => `${prefix}${PATH16}`,
        },
        transfer_destinations: {
          _destinationId: (val3: string) => {
            const prefix3 = `${PATH17}/${val3}`;

            return {
              /**
               * @returns OK
               */
              put: (option: { body: Methods_b9arif['put']['reqBody'], config?: T | undefined }) =>
                fetch<Methods_b9arif['put']['resBody'], BasicHeaders, Methods_b9arif['put']['status']>(prefix, prefix3, PUT, option).json(),
              /**
               * @returns OK
               */
              $put: (option: { body: Methods_b9arif['put']['reqBody'], config?: T | undefined }) =>
                fetch<Methods_b9arif['put']['resBody'], BasicHeaders, Methods_b9arif['put']['status']>(prefix, prefix3, PUT, option).json().then(r => r.body),
              $path: () => `${prefix}${prefix3}`,
            };
          },
        },
      },
    },
  };
};

export type ApiInstance = ReturnType<typeof api>;
export default api;
