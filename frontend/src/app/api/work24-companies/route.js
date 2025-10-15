import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const authKey = searchParams.get('authKey');

  if (!authKey) {
    return new NextResponse('API key is missing', { status: 400 });
  }

  const targetUrl = `https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L31.do?authKey=${authKey}&callTp=L&returnType=XML&startPage=1&display=10`;

  try {
    const apiResponse = await fetch(targetUrl);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`Work24 Companies API Error: ${apiResponse.status}`, errorText);
      return new NextResponse(errorText, { status: apiResponse.status });
    }

    const xmlText = await apiResponse.text();
    
    return new NextResponse(xmlText, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml;charset=UTF-8',
      },
    });

  } catch (error) {
    console.error('Failed to fetch from Work24 Companies API:', error);
    return new NextResponse('Failed to fetch from external API.', { status: 500 });
  }
}
