package com.hirepicker.config.redis;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.server.standard.ServerEndpointRegistration;

@Component
public class ServerEndpointConfigurator extends ServerEndpointRegistration.Configurator implements ApplicationContextAware{

    private static volatile ApplicationContext context;

    @Override
    public <T> T getEndpointInstance(Class<T> clazz) throws InstantiationException {
        // Spring 컨텍스트에서 해당 클래스의 Bean을 찾아 반환
        return context.getBean(clazz);
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
       // Spring이 이 Configurator를 Bean으로 생성할 때 ApplicationContext를 주입
        ServerEndpointConfigurator.context = applicationContext;
    }
     
    
}
