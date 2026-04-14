import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { updateSession } from '@/utils/supabase/middleware';

export async function proxy(request: NextRequest) {
  let response = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  const isAccountRoute = pathname.startsWith('/account');
  const isAdminRoute = pathname.startsWith('/admin');
  const isDeliveryRoute = pathname.startsWith('/delivery');
  const isAdminLoginRoute = pathname === '/admin/login';

  if (!isAccountRoute && !isAdminRoute && !isDeliveryRoute) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isAdminLoginRoute) {
      return response;
    }

    if (isAdminRoute && !isAdminLoginRoute) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAdminRoute && !isAdminLoginRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
