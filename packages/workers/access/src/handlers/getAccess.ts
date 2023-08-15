import { Errors } from '@lenster/data/errors';
import response from '@lenster/lib/response';

import type { Env } from '../types';

export default async (id: string, env: Env) => {
  if (!id) {
    return response({ success: false, error: Errors.NoBody });
  }

  try {
    const clickhouseResponse = await fetch(
      `${env.CLICKHOUSE_REST_ENDPOINT}&default_format=JSONCompact`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cf: { cacheTtl: 600, cacheEverything: true },
        body: `SELECT * FROM rights WHERE id = '${id}';`
      }
    );

    if (clickhouseResponse.status !== 200) {
      return response({ success: false, error: Errors.StatusCodeIsNot200 });
    }

    const json: {
      data: [string, boolean, boolean, boolean][];
    } = await clickhouseResponse.json();

    if (json.data.length) {
      const data = json.data[0];
      return response({
        success: true,
        result: {
          id: data[0],
          isStaff: data[1],
          isGardener: data[2],
          isTrustedMember: data[3]
        }
      });
    }

    return response({
      success: true,
      result: { isStaff: false, isGardener: false, isTrustedMember: false }
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};